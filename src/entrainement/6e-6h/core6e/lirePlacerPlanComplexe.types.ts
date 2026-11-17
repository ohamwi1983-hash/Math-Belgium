/**
 * Couche core (6e) — types de `6gen95` « Lire et placer dans le plan complexe » (chapitre 5,
 * section « Affixes et racines carrées »).
 *
 * Un exercice = un repère FIXE (fenêtre [−5 ; 5] × [−5 ; 5], quadrillage d'une unité), des points à
 * coordonnées entières :
 * - A, d'affixe z (toujours) ; B, d'affixe w (seulement quand une opération l'utilise) ;
 * - deux OPÉRATIONS à placer (z̄, −z, −z̄, iz, 2z, z + w, z − w), chacune associée ensuite à sa
 *   transformation du plan ;
 * - C, sur une direction remarquable (un axe ou une diagonale du quadrillage), dont on lit le module
 *   et un argument (|z_C| exact).
 * Tous les points (données et images) restent dans [−4 ; 4] × [−4 ; 4] : jamais sur le bord du cadre.
 */

export interface PointEntier {
  x: number;
  y: number;
}

/** Opérations à placer : z̄, −z, −z̄, iz, 2z, z + w, z − w. */
export type IdOperationPlan = "conjugue" | "oppose" | "opposeConjugue" | "rotation" | "double" | "somme" | "difference";

/** Variantes (catalogue) = familles d'opérations. */
export type IdVarianteLirePlacer = "symetries" | "rotation-homothetie" | "translations";

/** Transformations proposées à l'écran « associer » (choix fermé). */
export type IdTransformationPlan =
  | "symetrieAxeReel"
  | "symetrieAxeImaginaire"
  | "symetrieCentrale"
  | "rotationPlus"
  | "rotationMoins"
  | "translationW"
  | "translationMoinsW"
  | "homothetie";

export interface ExerciceLirePlacer {
  variante: IdVarianteLirePlacer;
  /** Affixe z du point A. */
  z: PointEntier;
  /** Affixe w du point B, `null` si aucune opération ne l'utilise. */
  w: PointEntier | null;
  /** Point C (direction remarquable) : module et argument à lire. */
  c: PointEntier;
  /** Les deux opérations, dans l'ordre des écrans de placement. */
  operations: [IdOperationPlan, IdOperationPlan];
}
