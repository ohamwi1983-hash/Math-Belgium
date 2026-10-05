/**
 * Couche A — "Équations et inéquations du second degré" (quiz vrai/faux), soixante-et-unième
 * générateur, ajout ultérieur au chapitre 2. Tire une question dans la banque pré-écrite
 * (`banque.ts`) du thème (variante) actif — jamais de génération procédurale, voir
 * `core/quizEquationsSecondDegre.types.ts`. Structure identique à
 * `generateurs/quizStatistiqueDescriptive/` (gen59) et `generateurs/quizFonctionSecondDegre/` (gen60).
 */
import type { ExerciceQuizEquationsSecondDegre, GenerateurExerciceQuizEquationsSecondDegre, QuestionVraiFaux, VarianteQuizEquationsSecondDegre } from "../../core/quizEquationsSecondDegre.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_EQUATIONS_SECOND_DEGRE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizEquationsSecondDegre; label: string }[] = [
  { id: "vocabulaire", label: "Vocabulaire et généralités" },
  { id: "sansDiscriminant", label: "Résolution sans discriminant" },
  { id: "discriminant", label: "Le discriminant Δ" },
  { id: "demonstration", label: "Démonstration de la formule du discriminant" },
  { id: "sommeProduitRacines", label: "Somme et produit des racines" },
  { id: "factorisationGenerale", label: "Factorisation par la méthode générale" },
  { id: "inequations", label: "Inéquations et tableau de signes" },
];

function tirerQuestion(varianteId: VarianteQuizEquationsSecondDegre): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_EQUATIONS_SECOND_DEGRE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizEquationsSecondDegre,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizEquationsSecondDegre {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizEquationsSecondDegre(): ExerciceQuizEquationsSecondDegre {
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
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (20) : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizEquationsSecondDegre`)
 * pourrait répéter une question avant d'avoir couvert les 19 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `AppQuizEquationsSecondDegre.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizEquationsSecondDegre): GenerateurExerciceQuizEquationsSecondDegre {
  const banque = BANQUE_QUIZ_EQUATIONS_SECOND_DEGRE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
