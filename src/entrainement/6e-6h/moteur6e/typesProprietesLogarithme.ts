/**
 * Couche B (6e) — types pour `6gen13`, REFONTE TOTALE : le nombre d'écrans n'est plus FIXE (2) mais
 * dépend de la combinaison de caractéristiques de l'exercice tiré (1 écran PAR CARACTÉRISTIQUE,
 * voir `core6e/decompositionLogarithme.ts`) — ET CE NOMBRE VARIE même à l'intérieur d'une même
 * "variante" du catalogue, puisque l'ordre de construction (donc la profondeur de chaque
 * caractéristique) n'affecte PAS le compte d'écrans, mais le nombre de caractéristiques, lui, change
 * d'une variante à l'autre (3 ou 4, catalogue restreint — voir
 * `generateurs6e/proprietesLogarithme/index.ts`). Exercice PUREMENT SYMBOLIQUE : AUCUN écran numérique final (voir
 * `core6e/proprietesLogarithme.types.ts`) — le dernier écran reste une décomposition algébrique comme
 * les autres. Ni un dispatch par famille à séquence FIXE (6gen12/`typesExponentiellesProblemes.ts`,
 * phases énumérées en chaîne), ni une séquence commune unique (ancienne version de ce fichier, 2
 * écrans fixes) : `phase` est un simple INDEX NUMÉRIQUE dans la séquence propre à l'exercice COURANT
 * (`nombreEtapesAlgebriques`), la seule représentation qui generalise à un nombre d'écrans déterminé
 * À L'EXÉCUTION.
 */
import { calculerEtatsArgument } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseProprietesLogarithme = number;

/** Nombre d'écrans de l'exercice — un par caractéristique de la combinaison (produit/quotient/
 * puissance/racine/changementBase), AUCUN écran supplémentaire. */
export function nombreEtapesAlgebriques(exercice: ExerciceProprieteLogarithme): number {
  const etapesArgument = calculerEtatsArgument(exercice.arbre).length - 1;
  return etapesArgument + (exercice.avecChangementBase ? 1 : 0);
}

export function phaseInitiale(): PhaseProprietesLogarithme {
  return 0;
}

export function phaseApres(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): PhaseProprietesLogarithme | "termine" {
  const suivante = phase + 1;
  return suivante < nombreEtapesAlgebriques(exercice) ? suivante : "termine";
}

export interface ResultatExerciceProprietesLogarithme {
  exercice: ExerciceProprieteLogarithme;
  /** Un score par écran RÉELLEMENT traversé, dans l'ordre (longueur = `nombreEtapesAlgebriques(exercice)`). */
  scores: number[];
}

export interface EtatSessionProprietesLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProprieteLogarithme;
  exerciceCourant: ExerciceProprieteLogarithme;
  phase: PhaseProprietesLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Scores des écrans DÉJÀ clos de l'exercice courant, dans l'ordre (longueur = `phase`) — jamais
   * l'écran en cours, qui n'a pas encore de score définitif. */
  scoresPartiels: number[];
  /** Un booléen "révélé" par écran déjà clos, même index que `scoresPartiels` — jusqu'au 2025-10,
   * déduit indirectement de `scoresPartiels[i] === 0` (un succès ne vaut jamais exactement 0, la
   * pénalité par tentative garantissant un score strictement positif même à la dernière tentative
   * autorisée) ; tableau explicite ajouté pendant le balayage générique (point A). */
  revelesPartiels: boolean[];
  indexExercice: number;
  resultats: ResultatExerciceProprietesLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponse` qui a clos un écran par épuisement des
   * tentatives (réponse révélée) plutôt que par réussite — piège structurel documenté dans CLAUDE.md :
   * `etapeCourante.revelee` est remis à `false` DANS LE MÊME appel qui fait avancer `phase`, donc
   * jamais fiable lu depuis l'état PRÉ-transition côté `App6gen13.tsx`. */
  derniereTransitionRevelee: boolean;
}
