/**
 * Couche A (5e) — construction des branches de solutions de l'argument u (écran 1, 5gen10), à
 * partir d'un angle de référence B (EXACT — `RationnelPi`, régime "exact" — ou décimal seul, régime
 * "decimal"). Fonctions PURES, prennent B déjà déterminé (catalogue ou `Math.acos`/`asin`/`atan`) —
 * la sélection ALÉATOIRE de k/B (catalogue vs décimal, spécial vs général vs aucune solution) vit
 * dans `tirageK.ts`, jamais ici.
 */
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";
import { additionnerRationnelPi, negatifRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";
import type { BrancheAngle, ValeurPiOuDecimale } from "../../core5e/equationsTrigonometriques.types";

const DEUX_PI: RationnelPi = { numerateur: 2, denominateur: 1, degrePi: 1 };
const UNE_PI: RationnelPi = { numerateur: 1, denominateur: 1, degrePi: 1 };
const DEMI_PI: RationnelPi = { numerateur: 1, denominateur: 2, degrePi: 1 };
const ZERO_PI: RationnelPi = { numerateur: 0, denominateur: 1, degrePi: 1 };

function exacte(v: RationnelPi): ValeurPiOuDecimale {
  return { exact: v, decimal: valeurNumerique(v) };
}
function decimale(v: number): ValeurPiOuDecimale {
  return { exact: null, decimal: v };
}

/** cos(u)=1 → u=2nπ ; cos(u)=-1 → u=π+2nπ. Toujours régime exact (0 et π sont des multiples de π
 * par construction, jamais besoin d'un régime décimal pour ce cas). */
export function brancheSpecialeCos(signe: 1 | -1): BrancheAngle {
  return { constante: exacte(signe === 1 ? ZERO_PI : UNE_PI), periode: exacte(DEUX_PI) };
}

/** sin(u)=1 → u=π/2+2nπ ; sin(u)=-1 → u=-π/2+2nπ. */
export function brancheSpecialeSin(signe: 1 | -1): BrancheAngle {
  return { constante: exacte(signe === 1 ? DEMI_PI : negatifRationnelPi(DEMI_PI)), periode: exacte(DEUX_PI) };
}

/** cos(u)=k, k≠±1 → u=±B+2nπ (2 branches), B=arccos(k). `B` non-null ⟹ régime exact (catalogue) ;
 * `B` null ⟹ régime décimal, `Bdecimal` seul porte la valeur. */
export function branchesGeneralesCos(B: RationnelPi | null, Bdecimal: number): BrancheAngle[] {
  if (B !== null) {
    return [
      { constante: exacte(B), periode: exacte(DEUX_PI) },
      { constante: exacte(negatifRationnelPi(B)), periode: exacte(DEUX_PI) },
    ];
  }
  return [
    { constante: decimale(Bdecimal), periode: decimale(2 * Math.PI) },
    { constante: decimale(-Bdecimal), periode: decimale(2 * Math.PI) },
  ];
}

/** sin(u)=k, k≠±1 → u=B+2nπ OU u=(π-B)+2nπ (2 branches), B=arcsin(k). */
export function branchesGeneralesSin(B: RationnelPi | null, Bdecimal: number): BrancheAngle[] {
  if (B !== null) {
    const piMoinsB = additionnerRationnelPi(UNE_PI, negatifRationnelPi(B));
    return [
      { constante: exacte(B), periode: exacte(DEUX_PI) },
      { constante: exacte(piMoinsB), periode: exacte(DEUX_PI) },
    ];
  }
  return [
    { constante: decimale(Bdecimal), periode: decimale(2 * Math.PI) },
    { constante: decimale(Math.PI - Bdecimal), periode: decimale(2 * Math.PI) },
  ];
}

/** tan(u)=k (toute valeur, jamais de restriction de domaine) → u=B+nπ (1 branche), B=arctan(k). */
export function brancheTan(B: RationnelPi | null, Bdecimal: number): BrancheAngle[] {
  if (B !== null) return [{ constante: exacte(B), periode: exacte(UNE_PI) }];
  return [{ constante: decimale(Bdecimal), periode: decimale(Math.PI) }];
}
