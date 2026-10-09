import type { ExerciceFamilleC, ExerciceFamilleC1, ExerciceFamilleC2, ExerciceFamilleC3, ExerciceFamilleC4 } from "../../../core6e/calculPrimitives.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Substitution algébrique manuelle") de `6gen23`.
 * Réexporté pour réutilisation en aval : `construireFamilleC` (+ granulaires `construireFamilleC1`
 * à `construireFamilleC4`).
 *
 * 4 sous-types, chacun avec sa propre substitution u(x) et sa propre formule fermée (dérivées à la
 * main, voir commentaire de chaque constructeur) — pas de modèle générique partagé ici (contrairement
 * aux familles A/B), la substitution change trop de nature d'un sous-type à l'autre.
 */

// ============================================================================
// Sous-type 1 — x·√(ax+b), u=ax+b.
// ============================================================================

/** f(x)=k·x·√(ax+b). u=ax+b ⇒ x=(u-b)/a, dx=du/a.
 * ∫k·x·√u·(du/a) = k/a²·∫(u-b)√u du = k/a²·[(2/5)u^(5/2) - b(2/3)u^(3/2)]. */
export function construireFamilleC1(): ExerciceFamilleC1 {
  const a = tirerParmi([1, 2, 3] as const);
  const b = tirerEntierNonNul(-3, 5);
  const k = 1;
  const integrandeReference = (x: number) => k * x * Math.sqrt(a * x + b);
  const uReference = (x: number) => a * x + b;
  const xDeUReference = (u: number) => (u - b) / a;
  const uPrimeReference = () => a;
  const integrandeEnUReference = (u: number) => (k / (a * a)) * (Math.pow(u, 1.5) - b * Math.sqrt(u));
  const primitiveEnUReference = (u: number) => (k / (a * a)) * ((2 / 5) * Math.pow(u, 2.5) - b * (2 / 3) * Math.pow(u, 1.5));
  const primitiveReference = (x: number) => primitiveEnUReference(uReference(x));
  return { famille: "C", sousType: "1", a, b, k, uReference, xDeUReference, uPrimeReference, integrandeEnUReference, primitiveEnUReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 2 — u=arctan(x) ou arcsin(x), k·u²·u'.
// ============================================================================

/** f(x)=k·u(x)²·u'(x), u=arctan(x) ou arcsin(x) ⇒ f dx = k·u² du ⇒ primitive k·u³/3. */
export function construireFamilleC2(): ExerciceFamilleC2 {
  const cyclo = tirerParmi(["arctan", "arcsin"] as const);
  const k = tirerEntierNonNul(-3, 3);
  const uReference = cyclo === "arctan" ? Math.atan : Math.asin;
  const uPrimeReference = cyclo === "arctan" ? (x: number) => 1 / (1 + x * x) : (x: number) => 1 / Math.sqrt(1 - x * x);
  const integrandeReference = (x: number) => k * Math.pow(uReference(x), 2) * uPrimeReference(x);
  const integrandeEnUReference = (u: number) => k * u * u;
  const primitiveEnUReference = (u: number) => (k * Math.pow(u, 3)) / 3;
  const primitiveReference = (x: number) => primitiveEnUReference(uReference(x));
  return { famille: "C", sousType: "2", cyclo, k, uReference, uPrimeReference, integrandeEnUReference, primitiveEnUReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 3 — u=√x, k/((1+x)√x).
// ============================================================================

/** f(x)=k/((1+x)√x). u=√x ⇒ x=u², dx=2u du, u'(x)=1/(2√x)=1/(2u).
 * f dx = k/((1+u²)u) · 2u du = 2k/(1+u²) du ⇒ primitive 2k·arctan(u). */
export function construireFamilleC3(): ExerciceFamilleC3 {
  const k = tirerEntierNonNul(-3, 3);
  const uReference = (x: number) => Math.sqrt(x);
  const xDeUReference = (u: number) => u * u;
  const uPrimeReference = (x: number) => 1 / (2 * Math.sqrt(x));
  const integrandeReference = (x: number) => k / ((1 + x) * Math.sqrt(x));
  const integrandeEnUReference = (u: number) => (2 * k) / (1 + u * u);
  const primitiveEnUReference = (u: number) => 2 * k * Math.atan(u);
  const primitiveReference = (x: number) => primitiveEnUReference(uReference(x));
  return { famille: "C", sousType: "3", k, uReference, xDeUReference, uPrimeReference, integrandeEnUReference, primitiveEnUReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 4 — u=e^x+1, k·e^x/√(e^x+1).
// ============================================================================

/** f(x)=k·e^x/√(e^x+1). u=e^x+1 ⇒ du=e^x dx (le facteur e^x DISPARAÎT directement, aucun besoin
 * de réexprimer x). f dx = k/√u du ⇒ primitive 2k√u. */
export function construireFamilleC4(): ExerciceFamilleC4 {
  const k = tirerEntierNonNul(-3, 3);
  const uReference = (x: number) => Math.exp(x) + 1;
  const uPrimeReference = (x: number) => Math.exp(x);
  const integrandeReference = (x: number) => (k * Math.exp(x)) / Math.sqrt(Math.exp(x) + 1);
  const integrandeEnUReference = (u: number) => k / Math.sqrt(u);
  const primitiveEnUReference = (u: number) => 2 * k * Math.sqrt(u);
  const primitiveReference = (x: number) => primitiveEnUReference(uReference(x));
  return { famille: "C", sousType: "4", k, uReference, uPrimeReference, integrandeEnUReference, primitiveEnUReference, primitiveReference, integrandeReference };
}

/** Tirage équiprobable du sous-type — nom stable réutilisé en aval. */
export function construireFamilleC(): ExerciceFamilleC {
  const sousType = tirerEntier(1, 4);
  if (sousType === 1) return construireFamilleC1();
  if (sousType === 2) return construireFamilleC2();
  if (sousType === 3) return construireFamilleC3();
  return construireFamilleC4();
}
