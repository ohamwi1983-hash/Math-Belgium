import type { TermeA } from "../../core6e/calculPrimitives.types";
import type { TermeDeveloppe } from "../../core6e/volumesRevolution.types";
import { evaluerTermeA, primitiveTermeA } from "../calculPrimitives/familles/A";

/**
 * Couche A (6e) — évaluation/primitive de `TermeDeveloppe` pour `6gen27`, famille A. RÉUTILISE
 * `evaluerTermeA`/`primitiveTermeA` (6gen23) pour tout terme `TermeA` pur (fréquence=1 :
 * puissance, constante, expX, cosX) ; les 2 formes ADDITIONNELLES (`expRate2`/`cosRate2`,
 * fréquence=2 — issues UNIQUEMENT du développement d'un carré, jamais présentes dans le f(x)
 * d'origine) sont gérées ici, jamais dans `familles/A.ts` (6gen23), qui n'a jamais ce besoin (ses
 * propres termes ne sont jamais élevés au carré).
 *
 * Formules : (a·e^x)² = a²·e^{2x}, primitive = (a²/2)·e^{2x}. a²cos²x = (a²/2) + (a²/2)cos(2x)
 * (identité cos²x=(1+cos2x)/2), primitive du terme cos(2x) = (1/2)sin(2x) — voir
 * `generateurs6e/volumesRevolution/familleA.ts` pour la construction de ces termes.
 */

function estTermeA(t: TermeDeveloppe): t is TermeA {
  return t.type !== "expRate2" && t.type !== "cosRate2";
}

export function evaluerTermeDeveloppe(t: TermeDeveloppe, x: number): number {
  if (estTermeA(t)) return evaluerTermeA(t, x);
  if (t.type === "expRate2") return t.coef * Math.exp(2 * x);
  return t.coef * Math.cos(2 * x);
}

export function primitiveTermeDeveloppe(t: TermeDeveloppe, x: number): number {
  if (estTermeA(t)) return primitiveTermeA(t, x);
  if (t.type === "expRate2") return (t.coef / 2) * Math.exp(2 * x);
  return (t.coef / 2) * Math.sin(2 * x);
}

export function evaluerDeveloppe(termes: TermeDeveloppe[], x: number): number {
  return termes.reduce((acc, t) => acc + evaluerTermeDeveloppe(t, x), 0);
}

export function primitiverDeveloppe(termes: TermeDeveloppe[], x: number): number {
  return termes.reduce((acc, t) => acc + primitiveTermeDeveloppe(t, x), 0);
}
