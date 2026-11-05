import type { ExercicePolygonesArcsSecteurs } from "../../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../../moteur5e/typesPolygonesArcsSecteurs";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "../../ui5e/formatPolygonesArcsSecteurs";
import { aireCercle, aireSecteur, CATALOGUE_VARIANTES_POLYGONES, circonference, genererExercicePolygonesArcsSecteurs, genererPolygonesAvecVariante, longueurArc } from "./index";

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

/** « ≈ 2,51 » — arrondi au centième, virgule décimale. */
function approcheLatex(x: number): string {
  return ` \\approx ${(Math.round(x * 100) / 100).toString().replace(".", "{,}")}`;
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

/** ★ arc et secteur entre sommets consécutifs ; ★★ dès qu'un arc ou un secteur couvre plusieurs côtés. */
function difficultePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): 1 | 2 | 3 {
  return exercice.arcMultiPas === null && exercice.secteurMultiPas === null ? 1 : 2;
}

function reponseBrevePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): FragmentConsigne[] {
  const arc = arcFinal(exercice);
  const secteur = secteurFinal(exercice);
  return [latex(`s = ${arc.latex}${approcheLatex(arc.valeur)}`), texte(" ; "), latex(`A = ${secteur.latex}${approcheLatex(secteur.valeur)}`)];
}

function correctionDetailleePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): EtapeCorrection[] {
  const { r, n } = exercice;
  return sequence(exercice).flatMap((phase): EtapeCorrection[] => {
    const sousQuestion = lettreDe(exercice, phase);
    switch (phase) {
      case "cercleEntier":
        return [
          { label: "Formules", sousQuestion, fragments: [latex("\\text{Circonférence} = 2\\pi r"), texte(" ; "), latex("\\text{Aire} = \\pi r^2")] },
          {
            label: "Calcul",
            sousQuestion,
            fragments: [
              latex(`2\\pi \\times ${r} = ${formatCirconferenceAttendueLatex(exercice)}${approcheLatex(circonference(r))}`),
              texte(" ; "),
              latex(`\\pi \\times ${r}^2 = ${formatAireTotaleAttendueLatex(exercice)}${approcheLatex(aireCercle(r))}`),
            ],
          },
        ];
      case "arcElementaire":
        return [
          { label: "Méthode", sousQuestion, fragments: [texte(`Les ${n} sommets partagent le cercle en ${n} arcs égaux : l'arc entre deux sommets consécutifs vaut `), latex(`\\dfrac{1}{${n}}`), texte(" de la circonférence.")] },
          { label: "Calcul", sousQuestion, fragments: [latex(`s = \\dfrac{1}{${n}} \\times 2\\pi \\times ${r} = ${formatArcElementaireAttendueLatex(exercice)}${approcheLatex(longueurArc(r, n, 1))}`)] },
        ];
      case "secteurElementaire":
        return [
          { label: "Méthode", sousQuestion, fragments: [texte("Le secteur entre deux sommets consécutifs vaut "), latex(`\\dfrac{1}{${n}}`), texte(" de l'aire du disque.")] },
          { label: "Calcul", sousQuestion, fragments: [latex(`A = \\dfrac{1}{${n}} \\times \\pi \\times ${r}^2 = ${formatSecteurElementaireAttendueLatex(exercice)}${approcheLatex(aireSecteur(r, n, 1))}`)] },
        ];
      case "arcMultiPas": {
        const k = exercice.arcMultiPas?.k ?? 0;
        return [
          { label: "Méthode", sousQuestion, fragments: [texte(`L'arc couvre ${k} côtés du polygone sur ${n} : il représente `), latex(`\\dfrac{${k}}{${n}}`), texte(" du cercle.")] },
          { label: "Calcul", sousQuestion, fragments: [latex(`s = \\dfrac{${k}}{${n}} \\times 2\\pi \\times ${r} = ${formatArcMultiPasAttendueLatex(exercice)}${approcheLatex(longueurArc(r, n, k))}`)] },
          { label: "Piège", sousQuestion, fragments: [texte(`On compte les CÔTÉS couverts (${k}), pas les sommets (${k + 1}).`)] },
        ];
      }
      case "secteurMultiPas": {
        const k = exercice.secteurMultiPas?.k ?? 0;
        return [
          { label: "Méthode", sousQuestion, fragments: [texte(`Le secteur couvre ${k} côtés du polygone sur ${n} : il représente `), latex(`\\dfrac{${k}}{${n}}`), texte(" du disque.")] },
          { label: "Calcul", sousQuestion, fragments: [latex(`A = \\dfrac{${k}}{${n}} \\times \\pi \\times ${r}^2 = ${formatSecteurMultiPasAttendueLatex(exercice)}${approcheLatex(aireSecteur(r, n, k))}`)] },
          ...(exercice.arcMultiPas === null ? [{ label: "Piège", sousQuestion, fragments: [texte(`On compte les CÔTÉS couverts (${k}), pas les sommets (${k + 1}).`)] }] : []),
        ];
      }
    }
  });
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
  titreDocument: "Polygones, arcs et secteurs — Évaluation",
  nomFichierBase: "polygones-arcs-secteurs",
  genererInstance: genererExercicePolygonesArcsSecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES_POLYGONES,
  genererInstanceAvecVariante: genererPolygonesAvecVariante,
  construireEnonce: construireEnoncePolygonesArcsSecteurs,
  construireCorrection: construireCorrectionPolygonesArcsSecteurs,
  difficulte: difficultePolygonesArcsSecteurs,
  reponseBreve: reponseBrevePolygonesArcsSecteurs,
  correctionDetaillee: correctionDetailleePolygonesArcsSecteurs,
  bareme: baremePolygonesArcsSecteurs,
  enoncePapier: enoncePapierPolygonesArcsSecteurs,
  dureeMinutes: 5,
};
