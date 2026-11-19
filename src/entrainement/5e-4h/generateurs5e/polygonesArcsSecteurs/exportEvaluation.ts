import type { ExercicePolygonesArcsSecteurs } from "../../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../../moteur5e/typesPolygonesArcsSecteurs";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  CriteresDifficulte,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "../../ui5e/formatPolygonesArcsSecteurs";
import { correctionDetailleePolygonesArcsSecteurs } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { approche } from "../../ui5e/corrigeTrigonometrie1";
import { aireSecteur, CATALOGUE_VARIANTES_POLYGONES, genererExercicePolygonesArcsSecteurs, genererPolygonesAvecVariante, longueurArc } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePolygonesArcsSecteurs>` pour 5gen7 (Polygones,
 * arcs et secteurs) — feuille d'exercices et évaluation. À l'écran, l'élève lit sur le schéma le
 * nombre k de côtés couverts par l'arc ou le secteur surligné ; le papier n'imprime pas le schéma :
 * l'énoncé décrit donc la figure et donne k en toutes lettres.
 *
 * `construireEnonce` garde UNE question par écran du générateur (cercle entier, arc et secteur
 * élémentaires, arc/secteur couvrant k côtés) : ce sont les étapes du corrigé. L'énoncé imprimé
 * (`enoncePapier`) ne demande que les grandeurs FINALES — l'arc et le secteur visés — en une seule
 * consigne : le cercle entier et, quand un arc ou un secteur couvre plusieurs côtés, l'arc ou le
 * secteur élémentaire ne sont que des étapes vers ces grandeurs (`.claude/rules/
 * feuilles-evaluations.md`). Valeurs exactes : celles de l'écran (`ui5e/formatPolygonesArcsSecteurs.ts`).
 */

/** Écrans réellement traversés, dans l'ordre du générateur (`phaseApres`). */
function sequence(exercice: ExercicePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs[] {
  const phases: PhasePolygonesArcsSecteurs[] = ["cercleEntier", "arcElementaire"];
  if (exercice.arcMultiPas !== null) phases.push("arcMultiPas");
  phases.push("secteurElementaire");
  if (exercice.secteurMultiPas !== null) phases.push("secteurMultiPas");
  return phases;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function lettreDe(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string {
  return LETTRES[sequence(exercice).indexOf(phase)];
}

/** « ≈ 2,51 » — arrondi au centième, virgule décimale (zéros finaux gardés). */
function approcheLatex(x: number): string {
  return ` \\approx ${approche(x, 2)}`;
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`), jugés sur l'énoncé PAPIER : un
 * écran de calcul par grandeur (cercle entier, arcs, secteurs : 3 à 5 étapes, aucun écran de pure
 * lecture — k est donné sur papier, compté sur la figure à l'écran puis utilisé dans le calcul),
 * méthode 0 (fraction k/n du cercle, imposée), piège 0 (k côtés donnés en toutes lettres), nombres 0
 * (valeurs exactes en π acceptées). */
function criteresDifficultePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleePolygonesArcsSecteurs(exercice)), methode: 0, piege: 0, nombres: 0 };
}

function description(exercice: ExercicePolygonesArcsSecteurs): string {
  return `Sur un cercle de centre O et de rayon r = ${exercice.r}, on place ${exercice.n} points régulièrement espacés : ce sont les sommets d'un polygone régulier à ${exercice.n} côtés.`;
}

function consigneEtape(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string {
  switch (phase) {
    case "cercleEntier":
      return "Calcule la circonférence et l'aire du cercle entier.";
    case "arcElementaire":
      return "Calcule la longueur de l'arc compris entre deux sommets consécutifs.";
    case "secteurElementaire":
      return "Calcule l'aire du secteur compris entre deux sommets consécutifs.";
    case "arcMultiPas":
      return `Calcule la longueur du plus court arc qui relie deux sommets séparés par ${exercice.arcMultiPas?.k} côtés du polygone.`;
    case "secteurMultiPas":
      return `Calcule l'aire du plus petit secteur délimité par deux sommets séparés par ${exercice.secteurMultiPas?.k} côtés du polygone.`;
  }
}

function construireEnoncePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): SectionExercice {
  const questions: QuestionExercice[] = sequence(exercice).map((phase) => ({ consigne: [texte(consigneEtape(exercice, phase))] }));
  return { enteteFragments: [texte(description(exercice))], questions };
}

/** Grandeur finale demandée pour l'arc et pour le secteur (écran multi-pas s'il existe). */
function arcFinal(exercice: ExercicePolygonesArcsSecteurs): { latex: string; valeur: number } {
  if (exercice.arcMultiPas !== null) return { latex: formatArcMultiPasAttendueLatex(exercice) ?? "", valeur: longueurArc(exercice.r, exercice.n, exercice.arcMultiPas.k) };
  return { latex: formatArcElementaireAttendueLatex(exercice), valeur: longueurArc(exercice.r, exercice.n, 1) };
}

function secteurFinal(exercice: ExercicePolygonesArcsSecteurs): { latex: string; valeur: number } {
  if (exercice.secteurMultiPas !== null) return { latex: formatSecteurMultiPasAttendueLatex(exercice) ?? "", valeur: aireSecteur(exercice.r, exercice.n, exercice.secteurMultiPas.k) };
  return { latex: formatSecteurElementaireAttendueLatex(exercice), valeur: aireSecteur(exercice.r, exercice.n, 1) };
}

function construireCorrectionPolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): BlocCorrection[] {
  const arc = arcFinal(exercice);
  const secteur = secteurFinal(exercice);
  return [
    { type: "paragraphe", fragments: [texte("Arc : "), latex(`s = ${arc.latex}${approcheLatex(arc.valeur)}`), texte(".")] },
    { type: "paragraphe", fragments: [texte("Secteur : "), latex(`A = ${secteur.latex}${approcheLatex(secteur.valeur)}`), texte(".")] },
  ];
}

// ============================================================================
// Feuilles enrichies (énoncé papier, difficulté, réponse brève, corrigé détaillé, barème).
// ============================================================================

function enoncePapierPolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): EnoncePapier {
  const arc =
    exercice.arcMultiPas !== null
      ? `la longueur du plus court arc qui relie deux sommets séparés par ${exercice.arcMultiPas.k} côtés du polygone`
      : "la longueur de l'arc compris entre deux sommets consécutifs";
  const secteur =
    exercice.secteurMultiPas !== null
      ? `l'aire du plus petit secteur délimité par deux sommets séparés par ${exercice.secteurMultiPas.k} côtés du polygone`
      : "l'aire du secteur compris entre deux sommets consécutifs";
  return {
    section: {
      enteteFragments: [texte(description(exercice))],
      questions: [{ consigne: [texte(`Calcule ${arc}, puis ${secteur}. Donne les valeurs exactes (en fonction de π), ou arrondies au centième.`)] }],
    },
    etapesParQuestion: [sequence(exercice).map((_, i) => LETTRES[i])],
  };
}


function reponseBrevePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): FragmentConsigne[] {
  const arc = arcFinal(exercice);
  const secteur = secteurFinal(exercice);
  return [latex(`s = ${arc.latex}${approcheLatex(arc.valeur)}`), texte(" ; "), latex(`A = ${secteur.latex}${approcheLatex(secteur.valeur)}`)];
}


/** Poids : cercle entier 1 ; l'arc final 1,5 et le secteur final 1,5 — partagés entre l'étape
 * élémentaire (0,5) et l'étape « plusieurs côtés » (1) quand celle-ci existe. Total toujours 4. */
function baremePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): BaremeExercice {
  const a = (phase: PhasePolygonesArcsSecteurs) => lettreDe(exercice, phase);
  const criteres: CritereBareme[] = [
    { sousQuestion: a("cercleEntier"), critere: [texte("Circonférence "), latex("2\\pi r"), texte(" et aire "), latex("\\pi r^2"), texte(" du cercle")], points: 1 },
    { sousQuestion: a("arcElementaire"), critere: [texte("Arc entre sommets consécutifs : "), latex(`\\dfrac{1}{${exercice.n}}`), texte(" de la circonférence")], points: exercice.arcMultiPas !== null ? 0.5 : 1.5 },
  ];
  if (exercice.arcMultiPas !== null) {
    criteres.push({ sousQuestion: a("arcMultiPas"), critere: [texte(`Arc couvrant ${exercice.arcMultiPas.k} côtés : `), latex(`\\dfrac{${exercice.arcMultiPas.k}}{${exercice.n}}`), texte(" de la circonférence")], points: 1 });
  }
  criteres.push({ sousQuestion: a("secteurElementaire"), critere: [texte("Secteur entre sommets consécutifs : "), latex(`\\dfrac{1}{${exercice.n}}`), texte(" de l'aire du disque")], points: exercice.secteurMultiPas !== null ? 0.5 : 1.5 });
  if (exercice.secteurMultiPas !== null) {
    criteres.push({ sousQuestion: a("secteurMultiPas"), critere: [texte(`Secteur couvrant ${exercice.secteurMultiPas.k} côtés : `), latex(`\\dfrac{${exercice.secteurMultiPas.k}}{${exercice.n}}`), texte(" de l'aire du disque")], points: 1 });
  }
  const multi = exercice.arcMultiPas !== null || exercice.secteurMultiPas !== null;
  return {
    reponseFinale: reponseBrevePolygonesArcsSecteurs(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Circonférence écrite "), latex("\\pi r"), texte(" (ou "), latex("\\pi d"), texte(" avec d pris pour le rayon)")], cout: "−0,5" },
      { description: [texte("Fraction appliquée à l'aire du disque pour un arc, ou à la circonférence pour un secteur")], cout: "0 pt sur la valeur concernée" },
      ...(multi ? [{ description: [texte("Nombre de sommets compté au lieu du nombre de côtés couverts (k + 1 au lieu de k)")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[texte("Valeurs exactes (en fonction de π) ou arrondies au centième")]],
  };
}

export const adaptateurEvaluationPolygonesArcsSecteurs: AdaptateurFeuilleExercices<ExercicePolygonesArcsSecteurs> = {
  // Toutes les instances exigent une calculatrice (valeurs décimales) : avertissement du panneau.
  calculatriceIndispensable: true,
  titreDocument: "Polygones, arcs et secteurs — Évaluation",
  nomFichierBase: "polygones-arcs-secteurs",
  genererInstance: genererExercicePolygonesArcsSecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES_POLYGONES,
  genererInstanceAvecVariante: genererPolygonesAvecVariante,
  construireEnonce: construireEnoncePolygonesArcsSecteurs,
  construireCorrection: construireCorrectionPolygonesArcsSecteurs,
  criteresDifficulte: criteresDifficultePolygonesArcsSecteurs,
  reponseBreve: reponseBrevePolygonesArcsSecteurs,
  correctionDetaillee: correctionDetailleePolygonesArcsSecteurs,
  bareme: baremePolygonesArcsSecteurs,
  enoncePapier: enoncePapierPolygonesArcsSecteurs,
};
