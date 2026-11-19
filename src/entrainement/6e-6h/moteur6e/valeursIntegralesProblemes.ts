import type { ExerciceFamilleF_Problemes, ExerciceFamilleG_Archimede } from "../core6e/integralesProblemes.types";

/**
 * Couche B (6e) — valeurs attendues de `6gen29` qui dépendent d'un ARRONDI demandé par la consigne
 * ou d'une écriture exacte : SOURCE UNIQUE de l'écran (`ui6e/formatIntegralesProblemes.ts`), du
 * corrigé détaillé (`generateurs6e/integralesProblemes/corrigeDetaille.ts`) et de la vérification
 * (`verificationIntegralesProblemes.ts`). N'importe rien de `generateurs6e/` ni de `ui6e/`.
 */

const arrondir = (v: number, decimales: number): number => {
  const f = 10 ** decimales;
  // `toPrecision(12)` : 14,95 × 10 vaut 149,49999999999997 en flottant, arrondi à 149 sinon.
  const r = Math.round(Number((v * f).toPrecision(12))) / f;
  return Object.is(r, -0) ? 0 : r;
};

// ============================================================================
// Famille F — surplus du consommateur.
// ============================================================================

/** Point d'équilibre arrondi au centième, comme le demande la consigne (étape 1). */
export function equilibreArrondiF(e: ExerciceFamilleF_Problemes): { Q: number; P: number } {
  return { Q: arrondir(e.Q, 2), P: arrondir(e.P, 2) };
}

/** Surplus calculé avec Q et P arrondis au centième (méthode de la consigne et du corrigé) :
 * S = (A/k)(1 − e^{−kQ}) − P·Q, NON arrondi. */
export function surplusAvecArrondisF(e: ExerciceFamilleF_Problemes): number {
  const { Q, P } = equilibreArrondiF(e);
  const k = e.kNum / e.kDen;
  return (e.A / k) * (1 - Math.exp(-k * Q)) - P * Q;
}

/** Même surplus au centième : dernière ligne du calcul dans le corrigé. */
export function surplusAuCentiemeF(e: ExerciceFamilleF_Problemes): number {
  return arrondir(surplusAvecArrondisF(e), 2);
}

/** Surplus attendu, arrondi au dixième comme le demande la consigne (réponse affichée) — arrondi de
 * la valeur au centième écrite dans le corrigé, pour que le corrigé et l'écran ne se contredisent
 * jamais (14,949 → 14,95 → 15,0). */
export function surplusAuDixiemeF(e: ExerciceFamilleF_Problemes): number {
  return arrondir(surplusAuCentiemeF(e), 1);
}

/** Une réponse « arrondie au dixième » est juste si elle est à au plus un demi-dixième du surplus
 * au centième du corrigé (méthode de la consigne) OU du surplus exact (élève qui garde les valeurs
 * de la calculatrice non arrondies). */
export const DEMI_DIXIEME = 0.05 + 1e-9;

// ============================================================================
// Famille G, Archimède — fraction débordée.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction EXACTE (irréductible) V_bille / V_verre = (4/3·r³) / (k²L²/2) = 8r³ / (3k²L²), en
 * entiers : k = kNum/kDen, r = rNum/rDen (r ∈ {1 ; 1,5 ; 2}). */
export function fractionDebordeeArchimede(e: ExerciceFamilleG_Archimede): { num: number; den: number } {
  const rDen = Number.isInteger(e.r) ? 1 : 2;
  const rNum = Math.round(e.r * rDen);
  const { kNum, kDen, L } = e.paraboloide;
  const num = 8 * rNum ** 3 * kDen * kDen;
  const den = 3 * rDen ** 3 * kNum * kNum * L * L;
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

/** Valeur décimale de la fraction débordée. */
export function valeurFractionDebordee(e: ExerciceFamilleG_Archimede): number {
  const { num, den } = fractionDebordeeArchimede(e);
  return num / den;
}

/** Tolérance de la fraction débordée : fraction exacte ou valeur approchée à trois chiffres
 * significatifs (écart relatif ≤ 0,5 %, marge 0,6 %). */
export function toleranceFractionDebordee(e: ExerciceFamilleG_Archimede): number {
  return 0.006 * valeurFractionDebordee(e);
}
