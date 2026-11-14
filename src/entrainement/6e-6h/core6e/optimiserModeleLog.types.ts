/**
 * Couche core (6e) — contrat de `6gen91` « Optimiser un modèle logarithmique » (chapitre 3,
 * section « etude », processus 3 TRANSFÉRER). Problème EN CONTEXTE : une grandeur est modélisée par
 * une fonction contenant un logarithme ; on cherche la valeur de la variable qui la rend optimale.
 *
 * Cinq situations (= `forme` du profil d'évaluation) :
 * - `engrais` : rendement R(x) = c + a·ln(1 + x) − b·x (dose optimale, maximum en x = a/b − 1) ;
 * - `benefice` : bénéfice B(q) = a·ln(q) − b·q − c (production optimale, maximum en q = a/b) ;
 * - `rendement-moyen` : bénéfice moyen f(x) = (a·ln(x) + d)/x (maximum en x = eᵏ, d = a(1 − k)) ;
 * - `cout-moyen` : coût moyen C(x) = a·x·ln(x) − b·x + c (minimum en x = eᵏ, b = a(k + 1)) ;
 * - `debit` : débit d'une route D(v) = a·v − b·v·ln(v) (maximum en v = eᵏ, a = b(k + 1)).
 *
 * Les paramètres sont tirés « à l'envers » (l'optimum d'abord) pour que la valeur qui annule la
 * dérivée s'écrive exactement (entier, fraction, e, eᵏ). `mode` fixe la précision demandée à
 * l'écran 5 : `exacte` (valeurs exactes en e, faisables sans calculatrice) ou `arrondie` (valeurs en
 * contexte arrondies — calculatrice). Les situations `engrais` et `benefice` sont toujours
 * `arrondie` (la valeur optimale contient ln(a/b)).
 */

export type IdVarianteOptimiserLog = "engrais" | "benefice" | "rendement-moyen" | "cout-moyen" | "debit";

export type ModeCalculOptimiserLog = "exacte" | "arrondie";

interface Base {
  mode: ModeCalculOptimiserLog;
  /** Borne supérieure du contexte (dose, production, vitesse maximales), dans l'unité de la variable. */
  M: number;
  /** Permutation des 4 options de l'écran « nature » : `ordreNature[i]` = indice canonique de
   * l'option affichée en i-ème position (l'option canonique 0 est la bonne). */
  ordreNature: number[];
}

/** R(x) = c + a·ln(1 + x) − b·x, x en centaines de kg/ha, R en q/ha. */
export interface ExerciceEngrais extends Base {
  variante: "engrais";
  culture: "blé" | "maïs" | "orge";
  a: number;
  b: number;
  c: number;
}

/** B(q) = a·ln(q) − b·q − c, q en centaines d'unités par mois, B en milliers d'euros. */
export interface ExerciceBenefice extends Base {
  variante: "benefice";
  produit: "vélos" | "trottinettes" | "imprimantes";
  a: number;
  b: number;
  c: number;
}

/** f(x) = (a·ln(x) + d)/x, d = a(1 − k), x en milliers de bocaux, f en euros par bocal. */
export interface ExerciceRendementMoyen extends Base {
  variante: "rendement-moyen";
  a: number;
  d: number;
  k: number;
}

/** C(x) = a·x·ln(x) − b·x + c, b = a(k + 1), x en centaines d'affiches, C en euros par affiche. */
export interface ExerciceCoutMoyen extends Base {
  variante: "cout-moyen";
  a: number;
  b: number;
  c: number;
  k: number;
}

/** D(v) = a·v − b·v·ln(v), a = b(k + 1), v en dizaines de km/h, D en centaines de véhicules/h. */
export interface ExerciceDebit extends Base {
  variante: "debit";
  a: number;
  b: number;
  k: number;
}

export type ExerciceOptimiserLog = ExerciceEngrais | ExerciceBenefice | ExerciceRendementMoyen | ExerciceCoutMoyen | ExerciceDebit;
