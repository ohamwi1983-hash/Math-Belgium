import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { consigneGenerale, formatReponseAttenduePhaseLatex, questionFinale } from "../../ui5e/formatLectureGraphiqueDerivees";
import { labelAsymptoteLatex } from "../../ui5e/formatLectureGraphiqueLimites";
import {
  calculerViewBoxLectureGraphiqueDerivees,
  construireDomainesPieces,
  construireEvaluateurCourbeDerivees,
  construireMarqueursPointIsole,
} from "../../ui5e/lectureGraphiqueDeriveesCourbe";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./index";

// `IdAsymptote`/`CibleAsymptote`/`SlotAsymptote`/`listeAsymptotes` DUPLIQUÉS ici depuis
// `moteur5e/typesLectureGraphiqueLimites.ts` — `generateurs*/` n'importe JAMAIS `moteur*/` (règle
// non négociable du CLAUDE.md racine), y compris pour un simple calcul de LISTE de slots (TypeScript
// reste structurellement typé : cette réplique locale reste assignable à `labelAsymptoteLatex`,
// `ui5e/formatLectureGraphiqueLimites.ts`, sans importer les symboles `moteur5e` eux-mêmes). Copie
// FIDÈLE de la même fonction déjà dupliquée par `lectureGraphiqueLimites/exportEvaluation.ts` (même
// sous-objet `exercice.asymptotique : ExerciceLectureGraphiqueLimites`, même 5gen22 en amont) — à
// resynchroniser avec l'original si `typesLectureGraphiqueLimites.ts` change. Seule `listeAsymptotes`
// est nécessaire ici (jamais `listeComportements`, propre à l'écran "completerLimites" de 5gen22,
// absent de 5gen30).
type IdAsymptote = { kind: "va"; index: number } | { kind: "horizontale"; cote?: "gauche" | "droit" } | { kind: "oblique" };
type CibleAsymptote = { kind: "verticale"; x: number } | { kind: "horizontale"; y: number } | { kind: "oblique"; pente: number; ordonnee: number };

interface SlotAsymptote {
  id: IdAsymptote;
  cible: CibleAsymptote;
}

function listeAsymptotes(asymptotique: ExerciceLectureGraphiqueLimites): SlotAsymptote[] {
  const slots: SlotAsymptote[] = asymptotique.vas.map((va, index) => ({ id: { kind: "va", index }, cible: { kind: "verticale", x: va.position } }));
  const { infini } = asymptotique;
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
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees>` pour 5gen30 ("Lecture
 * graphique — dérivées et applications") — feuille d'évaluation, DERNIER générateur du chapitre
 * "Dérivées et applications".
 *
 * Écran interactif = jusqu'à 5 phases séquentielles sur LE MÊME graphique (`asymptotes` si présentes,
 * `tableauFPrime` TOUJOURS, `extremums` si présents, `tableauFSeconde` TOUJOURS, `inflexions` si
 * présents — voir `moteur5e/typesLectureGraphiqueDerivees.ts::ordreEcransLectureGraphiqueDerivees`,
 * jamais importé ici, condition répliquée localement par simple test de longueur des tableaux déjà
 * connus de l'instance). Condensées ici en UNE seule question papier par "paire" d'écrans
 * apparentée : le graphique une fois (`enteteHtml`), puis au plus 3 groupes de blancs — a) une ligne
 * par asymptote (comme 5gen22), b) le comportement des extrema (abscisse/nature/ordonnée, SEULEMENT
 * si `exercice.extrema.length>0`), c) l'abscisse des points d'inflexion (SEULEMENT si
 * `exercice.inflexions.length>0`).
 *
 * **Simplification DÉLIBÉRÉE vs l'écran** : les phases `tableauFPrime`/`tableauFSeconde` (tableau de
 * signes de f'/f'' complet, avec zones/racines/exclusions — `moteur5e/verificationLectureGraphiqueDerivees.ts`)
 * ne sont PAS reconstruites sous forme de tableau imprimé indépendant : leur contenu utile pour une
 * feuille papier (nature de chaque extremum ⇒ signe de f' de part et d'autre ; existence d'un point
 * d'inflexion ⇒ changement de concavité) est absorbé dans les questions b)/c) ci-dessus, dont la
 * correction réutilise TEL QUEL `formatReponseAttenduePhaseLatex(exercice, "tableauFPrime"|"tableauFSeconde")`
 * (`ui5e/formatLectureGraphiqueDerivees.ts`, même formateur que le récapitulatif final interactif).
 * Reconstruire le tableau zones/racines/exclusions complet (`construireTableauDerivees`,
 * moteur5e) aurait exigé de dupliquer une algorithmique bien plus lourde que la simple liste de
 * slots dupliquée ci-dessus, pour un gain d'exactitude marginal sur une feuille imprimée (où
 * l'élève lit directement le nombre/la position des extrema/PI sur le graphique, jamais une
 * colonne "exclusion" abstraite). Cas limite couvert explicitement : si l'instance n'a NI asymptote
 * NI extremum NI PI (ex. famille `0va-aucune` + 0 extremum + 0 PI, tirage rare mais possible en
 * production, `genererExerciceLectureGraphiqueDerivees`), `construireQuestionsDerivees`/
 * `construireCorrectionLectureGraphiqueDerivees` ci-dessous retombent sur UNE question de repli
 * (jamais un `questions: []` vide) — vrai PAR CONSTRUCTION dans ce cas précis (0 extremum ⇒ f' ne
 * change jamais de signe ⇒ f est monotone sur toute la portion affichée, un seul morceau puisque 0
 * AV), donc une simple inférence logique sur des comptes déjà connus, jamais une valeur recalculée
 * indépendamment.
 *
 * Graphique : `enteteHtml`, un unique `<svg>` construit via `construireSvgFonction`
 * (`export/svgGraph.ts`, RÉUTILISÉ tel quel) — jamais `enteteFragments` pour le graphique lui-même
 * (même réserve que `lectureGraphiqueLimites/exportEvaluation.ts`, voir sa doc de tête). La
 * fonction évaluée et le viewBox RÉUTILISENT DIRECTEMENT (Couche présentation ↔ Couche présentation,
 * légitime — seul `moteur5e/` est interdit depuis les fichiers `generateurs5e/`) `ui5e/lectureGraphiqueDeriveesCourbe.ts` :
 * `calculerViewBoxLectureGraphiqueDerivees` (borne Y sur asymptotes/extrema/PI RÉELS, comme
 * `LectureGraphiqueDeriveesGraph.tsx`), `construireEvaluateurCourbeDerivees` (baseTrend+bumps, LA
 * MÊME évaluation que la vérité terrain stockée sur l'instance) et `construireMarqueursPointIsole`.
 * `construireEvaluerGrapheDerivees` ci-dessous ajoute la SEULE chose que cet évaluateur "plein"
 * n'a pas nativement (il a un repli "morceau le plus proche" hors domaine, utile pour ne jamais
 * planter, mais qui NE COUPE PAS visuellement au niveau d'une AV) : un test d'appartenance aux
 * morceaux `construireDomainesPieces` (déjà exclus d'un buffer autour de chaque AV), renvoyant
 * `null` en dehors — exactement le même patron que `construireEvaluerGrapheLimites` de
 * `lectureGraphiqueLimites/exportEvaluation.ts`, sans dupliquer la moindre formule mathématique
 * (aucune primitive/gabarit réécrit ici, seulement un filtre de domaine autour de fonctions déjà
 * pures et déjà réutilisées).
 *
 * Asymptotes dessinées en pointillés, EXACTEMENT le même post-traitement SVG que
 * `lectureGraphiqueLimites/exportEvaluation.ts` (`construireLigneAsymptoteSvg`/
 * `construireLignesAsymptotesSvg`, dupliqués ici car `construireSvgFonction` n'a nul paramètre pour
 * des lignes arbitraires et que ni `MARGE` ni la transformation données→pixels interne ne sont
 * exportées par `svgGraph.ts`) — appliqué à `exercice.asymptotique`, structurellement identique au
 * sous-objet déjà traité par 5gen22.
 */

const LARGEUR_GRAPHE = 300;
const HAUTEUR_GRAPHE = 240;
// Dupliqué depuis `MARGE` de `export/svgGraph.ts` (non exportée) — UNIQUEMENT pour repositionner les
// lignes d'asymptote au même repère pixel que la courbe déjà tracée par `construireSvgFonction`.
const MARGE_SVG_LOCALE = 10;
const COULEUR_ASYMPTOTE = "#495057";

function construireLigneAsymptoteSvg(x1: number, y1: number, x2: number, y2: number, viewBox: ViewBoxSvg): string {
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>`;
}

function construireLignesAsymptotesSvg(asymptotique: ExerciceLectureGraphiqueLimites, viewBox: ViewBoxSvg): string {
  const lignes: string[] = asymptotique.vas.map((va) => construireLigneAsymptoteSvg(va.position, viewBox.yMin, va.position, viewBox.yMax, viewBox));
  const { infini } = asymptotique;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, y, viewBox.xMax, y, viewBox));
  } else if (infini.type === "oblique") {
    lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, infini.pente * viewBox.xMin + infini.ordonnee, viewBox.xMax, infini.pente * viewBox.xMax + infini.ordonnee, viewBox));
  }
  return lignes.join("");
}

/** Voir l'en-tête de fichier — filtre de domaine autour de `construireEvaluateurCourbeDerivees`
 * (`ui5e/lectureGraphiqueDeriveesCourbe.ts`, RÉUTILISÉ tel quel), jamais une réécriture de la
 * courbe elle-même. */
function construireEvaluerGrapheDerivees(exercice: ExerciceLectureGraphiqueDerivees, xMin: number, xMax: number): (x: number) => number | null {
  const domaines = construireDomainesPieces(exercice.asymptotique, xMin, xMax);
  const f = construireEvaluateurCourbeDerivees(exercice, xMin, xMax);
  return (x) => (domaines.some((d) => x >= d.lo && x <= d.hi) ? f(x) : null);
}

function construireSvgLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): string {
  const vb = calculerViewBoxLectureGraphiqueDerivees(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const points = construireMarqueursPointIsole(exercice).map((m) => ({ x: m.x, y: m.y }));
  const svg = construireSvgFonction(construireEvaluerGrapheDerivees(exercice, vb.x[0], vb.x[1]), viewBox, {
    largeur: LARGEUR_GRAPHE,
    hauteur: HAUTEUR_GRAPHE,
    classe: "graphe-derivees",
    points,
  });
  // Post-traitement (voir l'en-tête de fichier) : réinséré APRÈS la courbe/les points, donc rendu
  // par-dessus, comme `LectureGraphiqueDeriveesGraph.tsx` (dashed, opacité réduite).
  return svg.replace("</svg>", `${construireLignesAsymptotesSvg(exercice.asymptotique, viewBox)}</svg>`);
}

// ============================================================================
// Questions — voir l'en-tête de fichier pour le choix de granularité (un groupe de blancs par
// "paire" d'écrans apparentée, jamais un par phase interactive individuelle).
// ============================================================================

function construireQuestionsAsymptotes(asymptotique: ExerciceLectureGraphiqueLimites): QuestionExercice[] {
  const slots = listeAsymptotes(asymptotique);
  return slots.map((slot) => ({
    consigne: [latex(labelAsymptoteLatex(slots, slot.id))],
    reponse: { type: "lignes", nombre: 1 },
  }));
}

function construireQuestionExtrema(exercice: ExerciceLectureGraphiqueDerivees): QuestionExercice {
  return {
    consigne: [
      texte(
        "Pour CHAQUE extremum repéré sur le graphique (là où la tangente est horizontale), indique, dans l'ordre : son abscisse approximative, sa nature (MAX ou min), puis son ordonnée approximative.",
      ),
    ],
    reponse: { type: "lignes", nombre: exercice.extrema.length },
  };
}

function construireQuestionInflexions(exercice: ExerciceLectureGraphiqueDerivees): QuestionExercice {
  return {
    consigne: [texte("Pour CHAQUE point d'inflexion repéré sur le graphique (là où la concavité change), donne son abscisse approximative.")],
    reponse: { type: "lignes", nombre: exercice.inflexions.length },
  };
}

/** Question de repli — voir l'en-tête de fichier ("Cas limite couvert explicitement") : uniquement
 * atteinte si NI asymptote NI extremum NI PI, cas où `f` est monotone par construction sur toute la
 * portion affichée. */
function construireQuestionRepli(): QuestionExercice {
  return {
    consigne: [texte("Cette fonction ne présente ni asymptote nommable, ni extremum, ni point d'inflexion sur la portion représentée : décris si f est croissante ou décroissante en observant directement le sens de la courbe.")],
    reponse: { type: "lignes", nombre: 2 },
  };
}

function construireQuestionsDerivees(exercice: ExerciceLectureGraphiqueDerivees): QuestionExercice[] {
  const questions: QuestionExercice[] = [...construireQuestionsAsymptotes(exercice.asymptotique)];
  if (exercice.extrema.length > 0) questions.push(construireQuestionExtrema(exercice));
  if (exercice.inflexions.length > 0) questions.push(construireQuestionInflexions(exercice));
  if (questions.length === 0) questions.push(construireQuestionRepli());
  return questions;
}

function construireEnonceLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): SectionExercice {
  return {
    enteteFragments: [texte(`${consigneGenerale()} ${questionFinale(exercice)}`)],
    enteteHtml: construireSvgLectureGraphiqueDerivees(exercice),
    questions: construireQuestionsDerivees(exercice),
  };
}

/** RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée (`formatReponseAttenduePhaseLatex`,
 * `ui5e/formatLectureGraphiqueDerivees.ts` — le MÊME formateur qui alimente déjà le récapitulatif
 * final interactif, `ResumeSessionLectureGraphiqueDerivees`) — jamais recalculée indépendamment ici.
 * Un paragraphe par ligne renvoyée par le formateur, dans l'ordre : asymptotes, puis nature+valeur
 * des extrema (2 formateurs concaténés — voir l'en-tête de fichier), puis position des PI. */
function construireCorrectionLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): BlocCorrection[] {
  const blocs: BlocCorrection[] = [];

  if (listeAsymptotes(exercice.asymptotique).length > 0) {
    blocs.push(...formatReponseAttenduePhaseLatex(exercice, "asymptotes").map((expr) => ({ type: "paragraphe" as const, fragments: [latex(expr)] })));
  }
  if (exercice.extrema.length > 0) {
    blocs.push(...formatReponseAttenduePhaseLatex(exercice, "tableauFPrime").map((expr) => ({ type: "paragraphe" as const, fragments: [latex(expr)] })));
    blocs.push(...formatReponseAttenduePhaseLatex(exercice, "extremums").map((expr) => ({ type: "paragraphe" as const, fragments: [latex(expr)] })));
  }
  if (exercice.inflexions.length > 0) {
    blocs.push(...formatReponseAttenduePhaseLatex(exercice, "inflexions").map((expr) => ({ type: "paragraphe" as const, fragments: [latex(expr)] })));
  }

  if (blocs.length === 0) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          "Il suffit d'observer le sens de la courbe : elle est monotone (toujours croissante ou toujours décroissante) sur toute la portion affichée, puisqu'aucun extremum n'y est présent.",
        ),
      ],
    });
  }

  return blocs;
}

export const adaptateurEvaluationLectureGraphiqueDerivees: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees> = {
  titreDocument: "Lecture graphique — dérivées et applications — Évaluation",
  nomFichierBase: "lecture-graphique-derivees",
  genererInstance: genererExerciceLectureGraphiqueDerivees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLectureGraphiqueDerivees,
  construireCorrection: construireCorrectionLectureGraphiqueDerivees,
  // FAUX, comme `lectureGraphiqueLimites/exportEvaluation.ts` : `enteteHtml` (graphique) est utilisé
  // — exclu explicitement par la doc de `regroupable` (`export/genererFeuilleExercices.ts`) — ET la
  // consigne texte varie déjà avec l'instance (`questionFinale`, dont le nombre de parties varie
  // selon extrema/inflexions présents), ET il y a potentiellement plusieurs questions par instance
  // (asymptotes + extrema + inflexions) : les 3 conditions d'exclusion du mécanisme sont réunies,
  // `regroupable` reste donc à sa valeur par défaut `false`/absent — laissé explicite ici pour
  // documenter la décision plutôt que de l'omettre silencieusement.
  regroupable: false,
};
