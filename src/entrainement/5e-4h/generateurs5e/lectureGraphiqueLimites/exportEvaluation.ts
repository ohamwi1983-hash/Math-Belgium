import type { ExerciceLectureGraphiqueLimites, SigneInfini } from "../../core5e/lectureGraphiqueLimites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import {
  consigneGenerale,
  consignePhase,
  formatReponseAttendueCompleterLimitesLatex,
  formatReponseAttendueNommerAsymptotesLatex,
  labelAsymptoteLatex,
  labelComportementLatex,
} from "../../ui5e/formatLectureGraphiqueLimites";
import { BUFFER_VA, calculerBornesXLimites, calculerViewBoxLectureGraphique, construireMarqueursPointIsole, construirePieces, evaluerPieceMelangee } from "../../ui5e/lectureGraphiqueLimitesCourbe";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "./index";

// `listeComportements`/`listeAsymptotes` (+ les types `IdComportement`/`CibleComportement`/`SlotComportement`/
// `IdAsymptote`/`CibleAsymptote`/`SlotAsymptote`) DUPLIQUÉS ici depuis `moteur5e/typesLectureGraphiqueLimites.ts`
// — `generateurs*/` n'importe JAMAIS `moteur*/` (règle non négociable du CLAUDE.md racine), y compris pour
// un import de simples types : TypeScript reste structurellement typé, donc ces définitions locales,
// identiques à celles de `moteur5e`, restent bien assignables aux paramètres de `labelComportementLatex`/
// `labelAsymptoteLatex` (`ui5e/formatLectureGraphiqueLimites.ts`) sans avoir besoin d'importer les symboles
// `moteur5e` eux-mêmes. Copie fidèle des fonctions — à resynchroniser si le tirage géométrique de
// `core5e/lectureGraphiqueLimites.types.ts` change.

type IdComportement = { kind: "va"; index: number; cote: "gauche" | "droit" } | { kind: "infini"; cote: "gauche" | "droit" };
type CibleComportement = { kind: "infini"; signe: SigneInfini } | { kind: "fini"; valeur: number };

interface SlotComportement {
  id: IdComportement;
  cible: CibleComportement;
}

function listeComportements(exercice: ExerciceLectureGraphiqueLimites): SlotComportement[] {
  const { infini } = exercice;
  let cibleInfiniGauche: CibleComportement;
  let cibleInfiniDroit: CibleComportement;
  if (infini.type === "horizontale") {
    cibleInfiniGauche = { kind: "fini", valeur: infini.limiteMoinsInfini };
    cibleInfiniDroit = { kind: "fini", valeur: infini.limitePlusInfini };
  } else if (infini.type === "oblique") {
    const signeDroit: SigneInfini = infini.pente > 0 ? 1 : -1;
    cibleInfiniDroit = { kind: "infini", signe: signeDroit };
    cibleInfiniGauche = { kind: "infini", signe: (-signeDroit) as SigneInfini };
  } else {
    cibleInfiniGauche = { kind: "infini", signe: infini.signeMoinsInfini };
    cibleInfiniDroit = { kind: "infini", signe: infini.signePlusInfini };
  }

  const slots: SlotComportement[] = [{ id: { kind: "infini", cote: "gauche" }, cible: cibleInfiniGauche }];
  exercice.vas.forEach((va, index) => {
    const cibleGauche: CibleComportement = va.pointIsoleGauche !== undefined ? { kind: "fini", valeur: va.pointIsoleGauche } : { kind: "infini", signe: va.signeGauche };
    const cibleDroit: CibleComportement = va.pointIsoleDroit !== undefined ? { kind: "fini", valeur: va.pointIsoleDroit } : { kind: "infini", signe: va.signeDroit };
    slots.push({ id: { kind: "va", index, cote: "gauche" }, cible: cibleGauche });
    slots.push({ id: { kind: "va", index, cote: "droit" }, cible: cibleDroit });
  });
  slots.push({ id: { kind: "infini", cote: "droit" }, cible: cibleInfiniDroit });
  return slots;
}

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

const LARGEUR_GRAPHE = 300;
const HAUTEUR_GRAPHE = 240;
// Dupliqué depuis `MARGE` de `export/svgGraph.ts` (non exportée) — UNIQUEMENT pour repositionner les
// lignes d'asymptote au même repère pixel que la courbe déjà tracée par `construireSvgFonction`.
const MARGE_SVG_LOCALE = 10;
// `COULEUR_AXE` de `export/svgGraph.ts` — dashed, pour rester distinct du bleu de la courbe
// (`COULEUR_COURBE_DEFAUT`) et du gris très clair de la grille (`COULEUR_GRILLE`).
const COULEUR_ASYMPTOTE = "#495057";

/** Aiguillage par morceau — bornes FIXES (`calculerBornesXLimites`), jamais le viewport (voir la doc
 * de `construireSegments` dans `ui5e/lectureGraphiqueLimitesCourbe.ts` sur ce piège, non pertinent
 * ici puisqu'un SVG imprimé n'a ni zoom ni pan, mais la fonction évaluée doit rester cohérente avec
 * le viewBox fixe passé à `construireSvgFonction`). */
function construireEvaluerGrapheLimites(exercice: ExerciceLectureGraphiqueLimites): (x: number) => number | null {
  const [xMin, xMax] = calculerBornesXLimites(exercice);
  const zones = construirePieces(exercice).map((piece) => ({
    piece,
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA,
  }));
  return (x: number) => {
    const zone = zones.find((z) => x >= z.lo && x <= z.hi);
    return zone ? evaluerPieceMelangee(zone.piece, zone.lo, zone.hi, x) : null;
  };
}

function construireLigneAsymptoteSvg(x1: number, y1: number, x2: number, y2: number, viewBox: ViewBoxSvg): string {
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>`;
}

/** Une ligne pointillée par asymptote RÉELLEMENT présente — même tirage de comportement à l'infini
 * que `LectureGraphiqueLimitesGraph.tsx` (0, 1 ou 2 horizontales selon égalité en ±∞ ; oblique unique
 * ; aucune ligne pour `infini.type === "aucune"`). */
function construireLignesAsymptotesSvg(exercice: ExerciceLectureGraphiqueLimites, viewBox: ViewBoxSvg): string {
  const lignes: string[] = exercice.vas.map((va) => construireLigneAsymptoteSvg(va.position, viewBox.yMin, va.position, viewBox.yMax, viewBox));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, y, viewBox.xMax, y, viewBox));
  } else if (infini.type === "oblique") {
    lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, infini.pente * viewBox.xMin + infini.ordonnee, viewBox.xMax, infini.pente * viewBox.xMax + infini.ordonnee, viewBox));
  }
  return lignes.join("");
}

function construireSvgLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): string {
  const vb = calculerViewBoxLectureGraphique(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const points = construireMarqueursPointIsole(exercice).map((m) => ({ x: m.x, y: m.y }));
  const svg = construireSvgFonction(construireEvaluerGrapheLimites(exercice), viewBox, {
    largeur: LARGEUR_GRAPHE,
    hauteur: HAUTEUR_GRAPHE,
    classe: "graphe-limites",
    points,
  });
  // Post-traitement : voir l'en-tête du fichier — `construireSvgFonction` n'a pas de paramètre pour
  // des lignes arbitraires, les asymptotes sont réinsérées ici, APRÈS la courbe/les points (donc
  // rendues par-dessus, comme les traits `dashed` de `LectureGraphiqueLimitesGraph.tsx`).
  return svg.replace("</svg>", `${construireLignesAsymptotesSvg(exercice, viewBox)}</svg>`);
}

function construireQuestionsComportements(exercice: ExerciceLectureGraphiqueLimites): QuestionExercice[] {
  return listeComportements(exercice).map((slot) => ({
    consigne: [latex(labelComportementLatex(exercice, slot.id))],
    reponse: { type: "lignes", nombre: 1 },
  }));
}

function construireQuestionsAsymptotes(exercice: ExerciceLectureGraphiqueLimites): QuestionExercice[] {
  const slots = listeAsymptotes(exercice);
  return slots.map((slot) => ({
    consigne: [latex(labelAsymptoteLatex(slots, slot.id))],
    reponse: { type: "lignes", nombre: 1 },
  }));
}

/** Consigne générale — TEXTE PUR (aucun fragment `latex()` mêlé), donc sans risque malgré le
 * `displayMode:true` systématique de `assemblerEvaluationHtml.ts` sur `enteteFragments` (voir l'en-
 * tête du fichier de la tâche : seul un fragment "latex" y est affecté par `displayMode`, un fragment
 * "texte" reste un simple texte échappé — `export/genererFeuilleExercicesHtml.ts::fragmentsVersHtml`).
 * Concatène les 2 consignes de phase (`consignePhase`) SEULEMENT si l'exercice a bien une 2e phase
 * (`nommerAsymptotes` sautée à l'écran quand `listeAsymptotes` est vide — 0 AV + infini "aucune"). */
function construireConsigneGeneraleTexte(exercice: ExerciceLectureGraphiqueLimites): string {
  const base = `${consigneGenerale()} ${consignePhase("completerLimites")}`;
  return listeAsymptotes(exercice).length > 0 ? `${base} ${consignePhase("nommerAsymptotes")}` : base;
}

function construireEnonceLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): SectionExercice {
  return {
    enteteFragments: [texte(construireConsigneGeneraleTexte(exercice))],
    enteteHtml: construireSvgLectureGraphiqueLimites(exercice),
    questions: [...construireQuestionsComportements(exercice), ...construireQuestionsAsymptotes(exercice)],
  };
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
  // FAUX : `enteteHtml` (graphique) est utilisé — exclu explicitement par la doc de `regroupable`
  // (`export/genererFeuilleExercices.ts`) — ET la consigne texte varie déjà avec l'instance (nombre de
  // blancs à compléter, 2 à 9 selon le tirage — jamais une consigne générique constante), ET il y a
  // plusieurs questions par instance (une par blanc) : les 3 conditions d'exclusion du mécanisme sont
  // réunies, `regroupable` reste donc à sa valeur par défaut `false`/absent — laissé explicite ici pour
  // documenter la décision plutôt que de l'omettre silencieusement.
  regroupable: false,
};
