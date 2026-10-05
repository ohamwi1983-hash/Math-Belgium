/**
 * Couche A — "Géométrie analytique plane" (quiz vrai/faux), soixante-cinquième générateur. Tire une
 * question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif — jamais de génération
 * procédurale, voir `core/quizGeometrieAnalytique.types.ts`. Structure identique à
 * `generateurs/quizCalculVectoriel/` (gen64) et aux 5 quiz précédents.
 */
import type { ExerciceQuizGeometrieAnalytique, GenerateurExerciceQuizGeometrieAnalytique, QuestionVraiFaux, VarianteQuizGeometrieAnalytique } from "../../core/quizGeometrieAnalytique.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_GEOMETRIE_ANALYTIQUE } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizGeometrieAnalytique; label: string }[] = [
  { id: "equationDroite", label: "Équation d'une droite — à partir de 5 types de données d'entrée" },
  { id: "lectureGraphiqueDroite", label: "Lecture graphique — équation d'une droite" },
  { id: "constructionDroite", label: "Construction graphique — tracer une droite depuis son équation" },
  { id: "relationsDroites", label: "Relations entre droites — parallèle et perpendiculaire" },
  { id: "caracteristiquesDroite", label: "Caractéristiques d'une droite — pente, angle, ordonnée à l'origine" },
  { id: "distancePointDroite", label: "Distance point-droite et droite-droite" },
  { id: "intersectionDroites", label: "Intersection entre deux droites" },
  { id: "equationCercleGraphe", label: "Équation d'un cercle (non développée) à partir d'un graphe" },
  { id: "centreRayonCercle", label: "Centre et rayon d'un cercle depuis l'équation développée" },
  { id: "equationParaboleGraphe", label: "Équation d'une parabole depuis un graphe" },
  { id: "sommetFoyerParabole", label: "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée" },
  { id: "constructionParabole", label: "Construction graphique de la parabole — méthode cercle-droite" },
  { id: "lieuxGeometriques", label: "Lieux géométriques — intersection de deux lieux" },
];

function tirerQuestion(varianteId: VarianteQuizGeometrieAnalytique): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_GEOMETRIE_ANALYTIQUE[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizGeometrieAnalytique,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizGeometrieAnalytique {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizGeometrieAnalytique(): ExerciceQuizGeometrieAnalytique {
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
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizGeometrieAnalytique`)
 * pourrait répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée,
 * ré-mélangée à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de
 * cette fonction — voir `AppQuizGeometrieAnalytique.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizGeometrieAnalytique): GenerateurExerciceQuizGeometrieAnalytique {
  const banque = BANQUE_QUIZ_GEOMETRIE_ANALYTIQUE[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
