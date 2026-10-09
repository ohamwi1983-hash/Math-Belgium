import type { TermeA } from "../../core6e/calculPrimitives.types";
import { evaluerTermeA, primitiveTermeA } from "../calculPrimitives/familles/A";

/**
 * Couche A (6e) — utilitaire polynomial PUR pour `6gen26` : construit un polynôme "depuis ses
 * racines cibles" (produit de facteurs linéaires développé) puis le convertit en `TermeA[]`
 * (types "puissance"/"constante") pour RÉUTILISER `evaluerTermeA`/`primitiveTermeA` de 6gen23 —
 * voir l'en-tête de `core6e/calculAires.types.ts` pour la justification de cette réutilisation.
 *
 * Représentation interne d'un polynôme : `number[]` de coefficients par puissance CROISSANTE
 * (`poly[i]` = coefficient de x^i) — pratique pour multiplier par un facteur linéaire (x-r) par
 * convolution simple, jamais pour l'évaluation directe (déléguée aux `TermeA`).
 */

/** Multiplie `poly` (coefficients croissants) par le facteur linéaire (x - r). */
function multiplierParFacteurLineaire(poly: number[], r: number): number[] {
  const resultat = new Array(poly.length + 1).fill(0);
  for (let i = 0; i < poly.length; i++) {
    resultat[i + 1] += poly[i];
    resultat[i] += -r * poly[i];
  }
  return resultat;
}

/** Polynôme A·(x-r1)(x-r2)...(x-rn) sous forme de coefficients croissants — construction "depuis
 * les racines cibles" (voir en-tête `core6e/calculAires.types.ts`). Une racine répétée dans
 * `racines` produit une racine de multiplicité correspondante (ex. famille B "cubique", racine
 * double). */
export function polynomeDepuisRacines(racines: number[], coefDominant: number): number[] {
  let poly: number[] = [coefDominant];
  for (const r of racines) poly = multiplierParFacteurLineaire(poly, r);
  return poly;
}

/** Somme terme à terme de 2 polynômes (coefficients croissants), tailles éventuellement
 * différentes. */
export function additionnerPolynomes(a: number[], b: number[]): number[] {
  const n = Math.max(a.length, b.length);
  const resultat = new Array(n).fill(0);
  for (let i = 0; i < n; i++) resultat[i] = (a[i] ?? 0) + (b[i] ?? 0);
  return resultat;
}

/** Soustraction terme à terme (a - b). */
export function soustrairePolynomes(a: number[], b: number[]): number[] {
  return additionnerPolynomes(
    a,
    b.map((c) => -c),
  );
}

/** Convertit un polynôme (coefficients croissants) en `TermeA[]` — types "puissance" (degré ≥1) ou
 * "constante" (degré 0), coefficients nuls omis, degrés décroissants (ordre d'affichage naturel :
 * terme dominant en premier). */
export function polynomeVersTermes(poly: number[]): TermeA[] {
  const termes: TermeA[] = [];
  for (let n = poly.length - 1; n >= 0; n--) {
    const coef = poly[n];
    if (coef === 0) continue;
    if (n === 0) termes.push({ type: "constante", coef });
    else termes.push({ type: "puissance", coef, n });
  }
  return termes;
}

/** Évalue une somme de `TermeA` en x — réutilise `evaluerTermeA` (6gen23). */
export function evaluerTermes(termes: TermeA[], x: number): number {
  return termes.reduce((acc, t) => acc + evaluerTermeA(t, x), 0);
}

/** Primitive (constante nulle) d'une somme de `TermeA` en x — réutilise `primitiveTermeA`
 * (6gen23). */
export function primitiverTermes(termes: TermeA[], x: number): number {
  return termes.reduce((acc, t) => acc + primitiveTermeA(t, x), 0);
}
