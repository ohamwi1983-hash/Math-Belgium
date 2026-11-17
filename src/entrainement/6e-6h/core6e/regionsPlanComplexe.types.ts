import type { PointEntier } from "./lirePlacerPlanComplexe.types";

export type { PointEntier } from "./lirePlacerPlanComplexe.types";

/**
 * Couche core (6e) — types de `6gen98` « Régions du plan complexe » (chapitre 5, section
 * « Problèmes avancés »).
 *
 * Un exercice = une condition (ou deux, reliées par « et ») sur l'affixe z d'un point M ; l'élève
 * reconnaît la nature de la frontière, ses éléments, dit si le bord est inclus, puis choisit la
 * région parmi quatre figures. Repère FIXE [−5 ; 5]², données entières (frontières sur le
 * quadrillage), angles multiples de π/4.
 */

/** Variantes (catalogue). */
export type IdVarianteRegions = "disque" | "demi-plan" | "mediatrice" | "secteur" | "intersection";

/** Deux conditions : cercle + demi-plan (Re ou Im), ou Re + Im (« quadrant »). */
export type SousTypeIntersection = "cercle-demiplan" | "quadrant";

/** Nature de la frontière (choix fermé de l'écran a). */
export type NatureFrontiere = "cercle" | "verticale" | "horizontale" | "mediatrice" | "demiDroites";

/**
 * Une condition. Le CÔTÉ (intérieur/extérieur, ≥/≤, plus proche de A ou de B) et `large` (bord
 * inclus) sont des VERDICTS : tirés 1 fois sur 2 avant la boucle de rejet.
 */
export type ConditionRegion =
  /** |z − c| ≤ r (intérieur) ou |z − c| ≥ r (extérieur), stricte si `!large`. */
  | { type: "cercle"; centre: PointEntier; rayon: number; interieur: boolean; large: boolean }
  /** Re(z − w) ≥ m (axe « re », `superieur`) ou Im(z − w) ≤ m… : frontière x = m + Re(w) (ou y = m + Im(w)). */
  | { type: "demiPlan"; axe: "re" | "im"; w: PointEntier; m: number; superieur: boolean; large: boolean }
  /** |z − a| < |z − b| (`procheA`) ou |z − a| > |z − b|. */
  | { type: "mediatrice"; a: PointEntier; b: PointEntier; procheA: boolean; large: boolean }
  /** t1·π/4 ≤ arg(z − s) ≤ t2·π/4, −4 < t1 < t2 ≤ 4 (sommet S toujours exclu). */
  | { type: "secteur"; sommet: PointEntier; t1: number; t2: number; large: boolean };

export interface ExerciceRegions {
  variante: IdVarianteRegions;
  /** Seulement pour `intersection`. */
  sousType: SousTypeIntersection | null;
  /** Une condition, ou deux (intersection). */
  conditions: ConditionRegion[];
}
