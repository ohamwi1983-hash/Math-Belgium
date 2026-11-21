import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatReponseAttendueCompleterLimitesLatex, formatReponseAttendueNommerAsymptotesLatex } from "../../ui5e/formatLectureGraphiqueLimites";
import { construireSvgLectureGraphiqueLimites } from "./figures";
import { correctionDetailleeLectureGraphiqueLimites } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "./index";
import { profilLectureGraphiqueLimites } from "../profilsEvaluationLimites22-23";

// `listeAsymptotes` (+ les types `IdAsymptote`/`CibleAsymptote`/`SlotAsymptote`) DUPLIQUÉS ici depuis `moteur5e/typesLectureGraphiqueLimites.ts`
// — `generateurs*/` n'importe JAMAIS `moteur*/` (règle non négociable du CLAUDE.md racine), y compris pour
// un import de simples types : TypeScript reste structurellement typé, donc ces définitions locales,
// identiques à celles de `moteur5e`, restent bien assignables aux paramètres de `labelComportementLatex`/
// `labelAsymptoteLatex` (`ui5e/formatLectureGraphiqueLimites.ts`) sans avoir besoin d'importer les symboles
// `moteur5e` eux-mêmes. Copie fidèle des fonctions — à resynchroniser si le tirage géométrique de
// `core5e/lectureGraphiqueLimites.types.ts` change.

type IdAsymptote = { kind: "va"; index: number } | { kind: "horizontale"; cote?: "gauche" | "droit" } | { kind: "oblique" };
type CibleAsymptote = { kind: "verticale"; x: number } | { kind: "horizontale"; y: number } | { kind: "oblique"; pente: number; ordonnee: number };

interface SlotAsymptote {
  id: IdAsymptote;
  cible: CibleAsymptote;
}

function listeAsymptotes(exercice: ExerciceLectureGraphiqueLimites): SlotAsymptote[] {
  const slots: SlotAsymptote[] = exercice.vas.map((va, index) => ({ id: { kind: "va", index }, cible: { kind: "verticale", x: va.position } }));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    if (infini.limitePlusInfini === infini.limiteMoinsInfini) {
      slots.push({ id: { kind: "horizontale" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    } else {
      slots.push({ id: { kind: "horizontale", cote: "gauche" }, cible: { kind: "horizontale", y: infini.limiteMoinsInfini } });
      slots.push({ id: { kind: "horizontale", cote: "droit" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    }
  } else if (infini.type === "oblique") {
    slots.push({ id: { kind: "oblique" }, cible: { kind: "oblique", pente: infini.pente, ordonnee: infini.ordonnee } });
  }
  return slots;
}

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueLimites>` pour 5gen22 ("Limites et
 * asymptotes — lecture graphique") — feuille d'évaluation.
 *
 * Écran interactif = 2 phases (`completerLimites` puis `nommerAsymptotes`, la 2e sautée si aucune
 * asymptote n'est présente — voir `moteur5e/typesLectureGraphiqueLimites.ts::ordreComplet`) sur LE
 * MÊME graphique. Condensées ici en UNE seule question papier : le graphique une fois (`enteteHtml`),
 * suivi de tous les blancs à compléter (limites puis équations d'asymptotes) comme une liste
 * lettrée a)/b)/c)… — jamais reconstruit indépendamment : chaque label (`labelComportementLatex`/
 * `labelAsymptoteLatex`) et chaque réponse (`formatReponseAttendue*Latex`) vient de
 * `ui5e/formatLectureGraphiqueLimites.ts`, la même couche présentation que l'écran.
 *
 * Graphique : `enteteHtml`, un unique `<svg>` construit via `construireSvgFonction`
 * (`export/svgGraph.ts`, RÉUTILISÉ tel quel pour la grille/les axes/l'échantillonnage de la courbe)
 * — jamais `enteteFragments` pour le graphique lui-même (aucun équivalent SVG côté Word/PDF, voir
 * doc de `SectionExercice.enteteHtml`). La fonction évaluée est un simple aiguillage par morceau
 * (`construirePieces`/`evaluerPieceMelangee`, bornes FIXES `calculerBornesXLimites` — RÉUTILISÉS tels
 * quels depuis `ui5e/lectureGraphiqueLimitesCourbe.ts`, jamais réévalués indépendamment), qui renvoie
 * `null` dans le buffer `BUFFER_VA` autour de chaque AV : `construireSvgFonction` traite chaque `null`
 * comme une VRAIE coupure (voir son en-tête), donc une branche séparée de part et d'autre — EXACTEMENT
 * le même signal que `Plot.OfX` par morceau côté écran, sans dupliquer son mélange sigmoïde.
 *
 * Asymptotes dessinées en pointillés : `construireSvgFonction` n'a NUL paramètre pour des lignes
 * arbitraires (seulement `points`, pour des marqueurs ponctuels) — les asymptotes (verticales,
 * horizontale(s), oblique) sont donc ajoutées en POST-TRAITEMENT du `<svg>` déjà produit (une poignée
 * de `<line>` réinsérées juste avant `</svg>`), avec la MÊME transformation données→pixels que
 * `construireSvgFonction` (`sx`/`sy`, dupliquées ici car la fonction ni ses constantes internes —
 * `MARGE` — ne sont exportées : voir `MARGE_SVG_LOCALE` ci-dessous, à resynchroniser si cette
 * constante change côté `svgGraph.ts`). Même principe que `Line.PointAngle`/`Line.PointSlope` de
 * `LectureGraphiqueLimitesGraph.tsx` (dashed, opacité réduite) — jamais de texte "x=..."/"y=..." sur
 * le graphique lui-même (l'écran n'en affiche pas non plus, seule la position/direction compte, le
 * nom de chaque asymptote est justement ce qui est demandé en question). Les points isolés de
 * continuité (`construireMarqueursPointIsole`, RÉUTILISÉ tel quel) sont eux rendus nativement via
 * `options.points` de `construireSvgFonction` (pas de post-traitement nécessaire pour ceux-là).
 */

// ============================================================================
// Feuilles et évaluations (méthode `.claude/rules/feuilles-evaluations.md`).
// Énoncé papier = le graphique + UNE consigne globale (lire les limites, puis nommer les
// asymptotes) : les deux écrans (`completerLimites`, `nommerAsymptotes`) sont les étapes a) et b)
// du corrigé. La consigne ne révèle ni le nombre d'asymptotes verticales ni leur type (l'écran 1
// affiche les positions des AV dans ses libellés — sur papier, l'élève les repère lui-même).
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (droites en pointillés : asymptotes de la courbe ; point plein : point de la courbe).";

const CONSIGNE_PAPIER =
  "Lis sur le graphique les limites de f en −∞ et en +∞ et, de part et d'autre de chaque valeur où f n'est pas définie, ses limites à gauche et à droite. Nomme ensuite chaque asymptote de la courbe (verticale, horizontale ou oblique) avec son équation, ou indique qu'il n'y en a aucune.";

function sectionPapierLectureGraphique(exercice: ExerciceLectureGraphiqueLimites): SectionExercice {
  return {
    enteteFragments: [texte(LEGENDE)],
    enteteHtml: construireSvgLectureGraphiqueLimites(exercice),
    questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
  };
}

/** Étapes (titres « Étape n — consigne » du corrigé) : les deux écrans, consignes rédigées pour le papier. */
function construireEnonceLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): SectionExercice {
  return {
    ...sectionPapierLectureGraphique(exercice),
    questions: [
      { consigne: [texte("Lis les limites de f en −∞, en +∞ et de part et d'autre de chaque valeur où f n'est pas définie.")] },
      { consigne: [texte("Nomme chaque asymptote de la courbe (verticale, horizontale ou oblique) avec son équation, ou indique qu'il n'y en a aucune.")] },
    ],
  };
}

function enoncePapierLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): EnoncePapier {
  return { section: sectionPapierLectureGraphique(exercice), etapesParQuestion: [["a", "b"]] };
}

function aPointIsole(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.vas.some((va) => va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined);
}

function ahDistinctes(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.infini.type === "horizontale" && exercice.infini.limitePlusInfini !== exercice.infini.limiteMoinsInfini;
}

function avSignesIdentiques(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.vas.some((va) => va.pointIsoleGauche === undefined && va.pointIsoleDroit === undefined && va.signeGauche === va.signeDroit);
}

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function reponseBreveLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): FragmentConsigne[] {
  return [...joindre(formatReponseAttendueCompleterLimitesLatex(exercice)), texte(" — "), ...joindre(formatReponseAttendueNommerAsymptotesLatex(exercice))];
}

function baremeLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): BaremeExercice {
  const avecVA = exercice.vas.length > 0;
  const aucune = listeAsymptotes(exercice).length === 0;
  const critereAsymptotes = aucune ? "Aucune asymptote (conclusion cohérente avec les limites lues)" : "Chaque asymptote nommée avec son équation, et seulement elles";
  const criteres: CritereBareme[] = avecVA
    ? [
        { sousQuestion: "a", critere: [texte("Limites en −∞ et en +∞")], points: 1 },
        { sousQuestion: "a", critere: [texte("Limites à gauche et à droite de chaque asymptote verticale")], points: 1.5 },
        { sousQuestion: "b", critere: [texte(critereAsymptotes)], points: 1.5 },
      ]
    : [
        { sousQuestion: "a", critere: [texte("Limites en −∞ et en +∞")], points: 2 },
        { sousQuestion: "b", critere: [texte(critereAsymptotes)], points: 2 },
      ];
  const erreurs: ErreurFrequente[] = [];
  if (avecVA) erreurs.push({ description: [texte("Asymptote verticale écrite « y = … » au lieu de « x = … »")], cout: "0 pt sur cette asymptote" });
  if (aPointIsole(exercice)) erreurs.push({ description: [texte("±∞ annoncé du côté où la courbe arrive sur un point plein")], cout: "0 pt sur cette limite" });
  if (exercice.infini.type === "oblique") erreurs.push({ description: [texte("Limite finie annoncée en ±∞ alors que la courbe suit une droite oblique")], cout: "0 pt sur ces limites" });
  if (ahDistinctes(exercice)) erreurs.push({ description: [texte("Une seule asymptote horizontale donnée alors que les limites en −∞ et en +∞ diffèrent")], cout: "−0,5 sur b)" });
  if (erreurs.length === 0) erreurs.push({ description: [texte("Asymptote horizontale donnée sous la forme « x = … »")], cout: "0 pt sur cette asymptote" });
  return {
    reponseFinale: reponseBreveLectureGraphiqueLimites(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Asymptotes données dans n'importe quel ordre")], [texte("Équation seule (« x = 2 ») sans le sigle AV, AH ou AO")]],
  };
}

/** Niveau 1–7 : écran des limites = pure lecture ; écran des asymptotes = lecture, sauf une asymptote
 * oblique (pente calculée entre deux points de la droite) ; méthode 0 ; piège dans les DONNÉES : point
 * plein au bord d'une asymptote verticale, branches de même signe, deux asymptotes horizontales,
 * aucune asymptote. */
function criteresDifficulteLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): CriteresDifficulte {
  const lecture = exercice.infini.type === "oblique" ? ["a"] : ["a", "b"];
  const piege = aPointIsole(exercice) || avSignesIdentiques(exercice) || ahDistinctes(exercice) || listeAsymptotes(exercice).length === 0 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeLectureGraphiqueLimites(exercice), lecture), methode: 0, piege };
}

/** RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée (`formatReponseAttendue*Latex`,
 * `ui5e/formatLectureGraphiqueLimites.ts` — la même couche présentation qui alimente déjà le
 * récapitulatif final interactif, `ResumeSessionLectureGraphiqueLimites`) — jamais recalculée
 * indépendamment ici. */
function construireCorrectionLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): BlocCorrection[] {
  const lignesLimites: BlocCorrection[] = formatReponseAttendueCompleterLimitesLatex(exercice).map((expression) => ({
    type: "paragraphe",
    fragments: [latex(expression)],
  }));
  if (listeAsymptotes(exercice).length === 0) return lignesLimites;
  const lignesAsymptotes: BlocCorrection[] = formatReponseAttendueNommerAsymptotesLatex(exercice).map((expression) => ({
    type: "paragraphe",
    fragments: [latex(expression)],
  }));
  return [...lignesLimites, ...lignesAsymptotes];
}

export const adaptateurEvaluationLectureGraphiqueLimites: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueLimites> = {
  titreDocument: "Limites et asymptotes — lecture graphique — Évaluation",
  nomFichierBase: "lecture-graphique-limites",
  genererInstance: genererExerciceLectureGraphiqueLimites,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLectureGraphiqueLimites,
  construireCorrection: construireCorrectionLectureGraphiqueLimites,
  criteresDifficulte: criteresDifficulteLectureGraphiqueLimites,
  reponseBreve: reponseBreveLectureGraphiqueLimites,
  correctionDetaillee: correctionDetailleeLectureGraphiqueLimites,
  bareme: baremeLectureGraphiqueLimites,
  enoncePapier: enoncePapierLectureGraphiqueLimites,
  profilInstance: profilLectureGraphiqueLimites,
  // FAUX : `enteteHtml` (graphique) est utilisé — exclu explicitement par la doc de `regroupable`
  // (`export/genererFeuilleExercices.ts`) — ET la consigne texte varie déjà avec l'instance (nombre de
  // blancs à compléter, 2 à 9 selon le tirage — jamais une consigne générique constante), ET il y a
  // plusieurs questions par instance (une par blanc) : les 3 conditions d'exclusion du mécanisme sont
  // réunies : jamais de regroupement a), b), c) (aucune entrée dans `export/regroupementsPapier.ts`).
};
