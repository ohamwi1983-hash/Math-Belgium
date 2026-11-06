import type { ExerciceSuitesCombinees } from "../../core5e/suitesClassiques.types";
import { choisirParmi } from "./aleatoire";

/** Valeurs de x tirées : paires, positives ou négatives (r = −3x/2 entier). x = 6 (P = 216) est le
 * problème d'origine. */
export const VALEURS_X_COMBINEES = [-10, -8, -6, -4, -2, 2, 4, 6, 8, 10, 12] as const;

/** Scénario 3 — suites arithmétique et géométrique combinées.
 *
 * y, x, z avec x moyenne géométrique de y et z (x² = yz), m, y, z suite arithmétique (y = m + r,
 * z = m + 2r) et x·y·z = P. De x² = yz : x·y·z = x³ = P, donc x = ∛P (racine cubique réelle unique).
 * Ici m = x : (x + r)(x + 2r) = x² ⟺ 2r² + 3xr = 0 ⟺ r(2r + 3x) = 0 ⟺ r = 0 (suite constante,
 * rejetée) ou r = −3x/2. Coefficients du second degré dérivés du développement et résolus par la
 * formule générale (aucune valeur de r recopiée). */
export function construireSuitesCombinees(xChoisi: number = choisirParmi(VALEURS_X_COMBINEES)): ExerciceSuitesCombinees {
  const produitXYZ = xChoisi ** 3;
  const x = Math.round(Math.cbrt(produitXYZ));
  const m = x;
  // (m + r)(m + 2r) = x² ⟺ 2r² + 3m·r + (m² − x²) = 0
  const A = 2;
  const B = 3 * m;
  const C = m * m - x * x;
  const discriminant = B * B - 4 * A * C;
  const r1 = (-B + Math.sqrt(discriminant)) / (2 * A);
  const r2 = (-B - Math.sqrt(discriminant)) / (2 * A);
  const r = Math.abs(r1) > 1e-9 ? r1 : r2;
  const y = m + r;
  const z = m + 2 * r;
  return { scenario: "suitesCombinees", produitXYZ, premierTerme: m, x, r, arithmetique: [m, y, z], geometrique: [y, x, z] };
}
