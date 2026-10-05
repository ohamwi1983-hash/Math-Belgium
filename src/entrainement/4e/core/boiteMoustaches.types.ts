/**
 * Contrat — "Boîte à moustaches" (chapitre 5, septième et dernier générateur du chapitre) — voir
 * `promptgen36creation.md`, puis `promptgen36modifications.md` (contexte narratif + rendu Mafs +
 * notation indicielle + code couleur, voir CLAUDE.md).
 *
 * **Les 5 nombres (min/Q1/médiane/Q3/max) sont TOUJOURS donnés directement, jamais recalculés
 * depuis un tableau** — contrairement à "Étendue et écart interquartile"/"Médiane", qui les
 * dérivent d'un tableau x_i/n_i. Retrouver ces 5 nombres depuis des données brutes reste
 * l'exclusivité de ces deux générateurs précédents ; celui-ci part directement du résultat.
 *
 * **Contexte narratif** (`promptgen36modifications.md`) : n'importe que la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé — même principe que "Médiane"/"Moyenne
 * pondérée"). Pour la variante `comparaison`, les 2 séries partagent TOUJOURS le même contexte —
 * jamais deux contextes indépendants — un seul champ `contexte` porté par l'exercice, pas un par
 * série.
 */
import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export interface CinqNombres {
  min: number;
  q1: number;
  mediane: number;
  q3: number;
  max: number;
}

export interface PlageAxe {
  min: number;
  max: number;
}

export type VarianteBoiteMoustaches = "construction" | "lecture" | "comparaison";

export interface ExerciceBoiteMoustachesConstruction {
  variante: "construction";
  contexte: ContexteBienaymeTchebychev;
  valeurs: CinqNombres;
  bornePlage: PlageAxe;
}

export interface ExerciceBoiteMoustachesLecture {
  variante: "lecture";
  contexte: ContexteBienaymeTchebychev;
  valeurs: CinqNombres;
  bornePlage: PlageAxe;
}

/**
 * Série tirée avec la garantie — vérifiée à la construction, jamais laissée au hasard — que sa
 * médiane ET son écart interquartile diffèrent tous deux de ceux de l'autre série : les deux
 * questions catégorielles de l'écran "comparaison" ont donc toujours une réponse exacte, jamais
 * d'égalité ambiguë à trancher.
 */
export interface ExerciceBoiteMoustachesComparaison {
  variante: "comparaison";
  contexte: ContexteBienaymeTchebychev;
  serieA: CinqNombres;
  serieB: CinqNombres;
  bornePlage: PlageAxe;
  medianePlusGrande: "A" | "B";
  ecartInterquartilePlusGrand: "A" | "B";
}

export type ExerciceBoiteMoustaches =
  | ExerciceBoiteMoustachesConstruction
  | ExerciceBoiteMoustachesLecture
  | ExerciceBoiteMoustachesComparaison;

export type GenerateurExerciceBoiteMoustaches = () => ExerciceBoiteMoustaches;
