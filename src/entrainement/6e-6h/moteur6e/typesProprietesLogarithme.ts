/**
 * Couche B (6e) — types pour `6gen13`, REFONTE TOTALE : le nombre d'écrans n'est plus FIXE (2) mais
 * dépend de la combinaison de caractéristiques de l'exercice tiré (1 écran par caractéristique +
 * 1 écran numérique final, voir `core6e/decompositionLogarithme.ts`) — ET CE NOMBRE VARIE même à
 * l'intérieur d'une même "variante" du catalogue, puisque l'ordre de construction (donc la
 * profondeur de chaque caractéristique) n'affecte PAS le compte d'écrans, mais le nombre de
 * caractéristiques, lui, change d'une variante à l'autre (1 à 5). Ni un dispatch par famille à
 * séquence FIXE (6gen12/`typesExponentiellesProblemes.ts`, phases énumérées en chaîne), ni une
 * séquence commune unique (ancienne version de ce fichier, 2 écrans fixes) : `phase` est un simple
 * INDEX NUMÉRIQUE dans la séquence propre à l'exercice COURANT (`nombreEcransTotal`), la seule
 * représentation qui generalise à un nombre d'écrans déterminé À L'EXÉCUTION.
 */
import { calculerEtatsArgument } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseProprietesLogarithme = number;

/** Nombre d'écrans ALGÉBRIQUES (un par caractéristique de la combinaison — jamais l'écran numérique
 * final, compté séparément par `nombreEcransTotal`). */
export function nombreEtapesAlgebriques(exercice: ExerciceProprieteLogarithme): number {
  const etapesArgument = calculerEtatsArgument(exercice.arbre).length - 1;
  return etapesArgument + (exercice.avecChangementBase ? 1 : 0);
}

/** Nombre total d'écrans de l'exercice (étapes algébriques + 1 écran numérique final, TOUJOURS
 * présent, y compris quand il n'y a aucune étape algébrique — impossible en pratique, le catalogue
 * n'a aucune combinaison de taille 0, mais la formule reste correcte dans ce cas limite). */
export function nombreEcransTotal(exercice: ExerciceProprieteLogarithme): number {
  return nombreEtapesAlgebriques(exercice) + 1;
}

/** Vrai pour l'écran NUMÉRIQUE final (toujours le dernier). */
export function estEcranNumerique(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): boolean {
  return phase === nombreEtapesAlgebriques(exercice);
}

export function phaseInitiale(): PhaseProprietesLogarithme {
  return 0;
}

export function phaseApres(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): PhaseProprietesLogarithme | "termine" {
  const suivante = phase + 1;
  return suivante < nombreEcransTotal(exercice) ? suivante : "termine";
}

export interface ResultatExerciceProprietesLogarithme {
  exercice: ExerciceProprieteLogarithme;
  /** Un score par écran RÉELLEMENT traversé, dans l'ordre (longueur = `nombreEcransTotal(exercice)`). */
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
  indexExercice: number;
  resultats: ResultatExerciceProprietesLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponse` qui a clos un écran par épuisement des
   * tentatives (réponse révélée) plutôt que par réussite — piège structurel documenté dans CLAUDE.md :
   * `etapeCourante.revelee` est remis à `false` DANS LE MÊME appel qui fait avancer `phase`, donc
   * jamais fiable lu depuis l'état PRÉ-transition côté `App6gen13.tsx`. */
  derniereTransitionRevelee: boolean;
}
