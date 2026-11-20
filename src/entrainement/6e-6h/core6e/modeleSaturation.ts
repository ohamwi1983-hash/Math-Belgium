import type { Rat } from "../ui6e/nombresExpoLotG";

/**
 * Couche core — `6gen150` « Modèle L + C·qᵗ : refroidissement, réchauffement, plafonnement » (6e ch. 2,
 * § 7, processus 3 TRANSFÉRER ; lot G de l'audit, version propre de 6gen12 D). Trois mesures EXACTES
 * (entières) à t = 0, d, 2d ; le modèle les redonne exactement (audit E1 : plus de données arrondies).
 *
 * Décomposition du raisonnement (un écran par étape) :
 * 1. le rapport des ÉCARTS successifs r = (M₂ − M₁)/(M₁ − M₀) = q^d — L disparaît dans une différence
 *    (piège : le rapport des mesures, réflexe du modèle Q₀·rᵗ sans asymptote) ;
 * 2. la valeur limite L par M₁ − L = r(M₀ − L), puis C = M₀ − L (piège : la dernière mesure prise pour L) ;
 * 3. q = r^{1/d} (piège : q = r, le rapport porte sur d unités) ;
 * 4. une prévision T(t*) = L + C·q^{t*} (piège : L oublié) ;
 * 5. l'instant où la grandeur atteint un seuil S : q^t = (S − L)/C, puis ln à la calculatrice (cours,
 *    § 7, astuce « Trouver un instant précis » — décision de l'utilisateur : ln comme touche).
 */

export type VarianteModeleSaturation = "refroidissement" | "rechauffement" | "plafonnement";

export interface ExerciceModeleSaturation {
  variante: VarianteModeleSaturation;
  L: number;
  C: number;
  /** r = q^d (rationnel). */
  r: Rat;
  d: number;
  mesures: [number, number, number];
  q: number;
  tPrev: number;
  prevision: number;
  seuil: number;
  tSeuil: number;
  cleCollecteur: string;
}

export const modele = (e: ExerciceModeleSaturation, t: number): number => e.L + e.C * Math.pow(e.q, t);
