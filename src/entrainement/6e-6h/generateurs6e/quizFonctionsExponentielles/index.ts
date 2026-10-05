/**
 * Couche A — "Fonctions exponentielles" (quiz vrai/faux), 6gen65, ajout ultérieur au chapitre 2.
 * Tire une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de
 * génération procédurale, voir `core6e/quizFonctionsExponentielles.types.ts`. Structure identique
 * à 6gen64 (`quizFonctionsReciproquesCyclometriques`) et aux 4 quiz vrai/faux du chantier 4e
 * (gen59-62).
 */
import type {
  ExerciceQuizFonctionsExponentielles,
  GenerateurExerciceQuizFonctionsExponentielles,
  QuestionVraiFaux,
  VarianteQuizFonctionsExponentielles,
} from "../../core6e/quizFonctionsExponentielles.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_FONCTIONS_EXPONENTIELLES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizFonctionsExponentielles; label: string }[] = [
  { id: "limitesExponentielles", label: "Calcul de limites (fonctions exponentielles)" },
  { id: "domaineDeriveeExponentielles", label: "Domaine et dérivée de fonctions exponentielles" },
  { id: "graphiquesDeriveeExponentielles", label: "Graphique de la dérivée (fonctions exponentielles)" },
  { id: "equationsExponentielles", label: "Résoudre une équation exponentielle" },
  { id: "inequationsExponentielles", label: "Résoudre une inéquation exponentielle" },
  { id: "etudeFonctionExponentielle", label: "Étudier une fonction exponentielle (synthèse)" },
  { id: "exponentiellesProblemes", label: "Exponentielles : problèmes" },
];

function tirerQuestion(varianteId: VarianteQuizFonctionsExponentielles): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_FONCTIONS_EXPONENTIELLES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizFonctionsExponentielles,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizFonctionsExponentielles {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizFonctionsExponentielles(): ExerciceQuizFonctionsExponentielles {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

function melanger<T>(items: readonly T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Générateur SANS RÉPÉTITION pour un thème donné — chaque session étudiant porte sur un thème
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (35) : sans
 * cette précaution, le tirage indépendant habituel
 * (`genererExerciceQuizFonctionsExponentielles`) pourrait répéter une question avant d'avoir
 * couvert les 34 autres. État interne (file mélangée, ré-mélangée à chaque épuisement) enfermé
 * dans la fermeture, jamais partagé entre deux appels de cette fonction — voir `App6gen65.tsx`,
 * qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(
  varianteId: VarianteQuizFonctionsExponentielles,
): GenerateurExerciceQuizFonctionsExponentielles {
  const banque = BANQUE_QUIZ_FONCTIONS_EXPONENTIELLES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
