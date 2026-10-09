import type { ExerciceFamilleG, ExerciceFamilleG1, ExerciceFamilleG2, ExerciceFamilleG3, ExerciceFamilleG4 } from "../../../core6e/calculPrimitives.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille G ("Fractions rationnelles, décomposition en éléments
 * simples") de `6gen23`. Réexporté pour réutilisation en aval : `construireFamilleG` (+
 * granulaires `construireFamilleG1` à `construireFamilleG4`).
 *
 * **Construction "à l'envers"** pour les 4 sous-types : on choisit d'ABORD les coefficients de la
 * décomposition (A, B, C — ou h, m pour le sous-type 4), puis on RECOMBINE algébriquement pour
 * obtenir le numérateur de la fraction de départ — garantit des coefficients de décomposition
 * EXACTS et simples par construction, jamais une division/résolution de système approchée.
 */

// ============================================================================
// Sous-type 1 — racines réelles distinctes.
// ============================================================================

/** f(x) = [A(x-r2)+B(x-r1)] / ((x-r1)(x-r2)) — décomposition A/(x-r1)+B/(x-r2) par construction. */
export function construireFamilleG1(): ExerciceFamilleG1 {
  const r1 = tirerEntier(-4, 4);
  let r2 = r1;
  while (r2 === r1) r2 = tirerEntier(-4, 4);
  const A = tirerEntierNonNul(-4, 4);
  const B = tirerEntierNonNul(-4, 4);

  const integrandeReference = (x: number) => (A * (x - r2) + B * (x - r1)) / ((x - r1) * (x - r2));
  const decompositionReference = (vars: Record<string, number>) => vars.a / (vars.x - r1) + vars.b / (vars.x - r2);
  const primitiveReference = (x: number) => A * Math.log(Math.abs(x - r1)) + B * Math.log(Math.abs(x - r2));

  return { famille: "G", sousType: "1", r1, r2, A, B, decompositionReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 2 — fraction impropre.
// ============================================================================

/** f(x) = [(x-r)(x+d)+e] / (x-r), quotient x+d, reste e/(x-r) (e = A de la décomposition). */
export function construireFamilleG2(): ExerciceFamilleG2 {
  const r = tirerEntier(-3, 3);
  const d = tirerEntier(-3, 3);
  const e = tirerEntierNonNul(-4, 4);

  const quotientReference = (x: number) => x + d;
  const resteReference = (x: number) => e / (x - r);
  const integrandeReference = (x: number) => quotientReference(x) + resteReference(x);
  const decompositionReference = (vars: Record<string, number>) => vars.a / (vars.x - r);
  const primitiveReference = (x: number) => (x * x) / 2 + d * x + e * Math.log(Math.abs(x - r));

  return { famille: "G", sousType: "2", r, d, e, quotientReference, resteReference, decompositionReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 3 — dénominateur mixte x·(x²+1).
// ============================================================================

/** f(x) = [(A+B)x²+Cx+A] / (x(x²+1)) — décomposition A/x + (Bx+C)/(x²+1) par construction
 * (numérateur = A(x²+1) + (Bx+C)x). */
export function construireFamilleG3(): ExerciceFamilleG3 {
  let A = 0;
  let B = 0;
  do {
    A = tirerEntierNonNul(-3, 3);
    B = tirerEntierNonNul(-3, 3);
  } while (A + B === 0);
  const C = tirerEntierNonNul(-3, 3);

  const integrandeReference = (x: number) => ((A + B) * x * x + C * x + A) / (x * (x * x + 1));
  const decompositionReference = (vars: Record<string, number>) => vars.a / vars.x + (vars.b * vars.x + vars.c) / (vars.x * vars.x + 1);
  const primitiveReference = (x: number) => A * Math.log(Math.abs(x)) + (B / 2) * Math.log(x * x + 1) + C * Math.atan(x);

  return { famille: "G", sousType: "3", A, B, C, decompositionReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 4 — quadratique irréductible seule (complétion du carré → arctan).
// ============================================================================

/** f(x) = γ/(x²+px+q), p=2h, q=h²+m² (m>0) ⇒ x²+px+q=(x+h)²+m² par construction (complétion du
 * carré EXACTE, jamais approchée). */
export function construireFamilleG4(): ExerciceFamilleG4 {
  const h = tirerEntier(-3, 3);
  const m = tirerParmi([1, 2, 3] as const);
  const p = 2 * h;
  const q = h * h + m * m;
  const gamma = tirerEntierNonNul(-3, 3);

  const integrandeReference = (x: number) => gamma / (x * x + p * x + q);
  const decompositionReference = (vars: Record<string, number>) => gamma / (Math.pow(vars.x + vars.h, 2) + vars.m * vars.m);
  const primitiveReference = (x: number) => (gamma / m) * Math.atan((x + h) / m);

  return { famille: "G", sousType: "4", p, q, gamma, h, m, decompositionReference, primitiveReference, integrandeReference };
}

/** Tirage équiprobable du sous-type — nom stable réutilisé en aval. */
export function construireFamilleG(): ExerciceFamilleG {
  const sousType = tirerEntier(1, 4);
  if (sousType === 1) return construireFamilleG1();
  if (sousType === 2) return construireFamilleG2();
  if (sousType === 3) return construireFamilleG3();
  return construireFamilleG4();
}
