import type { Frac } from "../../core6e/intersectionsConiques.types";

/**
 * Couche A (6e) — arithmétique EXACTE sur `Frac` (`core6e/intersectionsConiques.types.ts`), propre à
 * `6gen61`. Toute la géométrie de la famille A (pente/ordonnée à l'origine d'une droite, coordonnées
 * de points construits par médiatrice/hauteur, coordonnées des points d'intersection) est calculée
 * en fractions EXACTES plutôt qu'en flottant — seule façon de garantir, par construction plutôt que
 * par vérification a posteriori, que le discriminant final est un carré parfait entier exact (voir
 * en-tête `familleA.ts` pour la preuve). Mirroir du petit utilitaire `reduireFraction` déjà présent
 * dans `equationConiqueCaracteristiques/aleatoire.ts` (6gen59), étendu ici en arithmétique complète
 * (+,-,×,÷) car la construction géométrique l'exige — jamais partagé entre les deux générateurs
 * (CLAUDE.md, chaque générateur garde ses propres fichiers).
 */

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Réduit `n/d` à sa forme irréductible, `d` toujours strictement positif. */
export function fracReduire(n: number, d: number): Frac {
  if (d === 0) throw new Error("fracReduire : dénominateur nul");
  const signe = d < 0 ? -1 : 1;
  const nn = signe * n;
  const dd = signe * d;
  const g = pgcd(nn, dd);
  return { n: nn / g, d: dd / g };
}

export function fracEntier(n: number): Frac {
  return { n, d: 1 };
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return fracReduire(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function fracSub(a: Frac, b: Frac): Frac {
  return fracReduire(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function fracMul(a: Frac, b: Frac): Frac {
  return fracReduire(a.n * b.n, a.d * b.d);
}

export function fracDiv(a: Frac, b: Frac): Frac {
  if (b.n === 0) throw new Error("fracDiv : division par zéro");
  return fracReduire(a.n * b.d, a.d * b.n);
}

export function fracNeg(a: Frac): Frac {
  return { n: -a.n, d: a.d };
}

export function fracEquals(a: Frac, b: Frac): boolean {
  return a.n * b.d === b.n * a.d;
}

export function fracToNumber(a: Frac): number {
  return a.n / a.d;
}

export function fracEstNul(a: Frac): boolean {
  return a.n === 0;
}
