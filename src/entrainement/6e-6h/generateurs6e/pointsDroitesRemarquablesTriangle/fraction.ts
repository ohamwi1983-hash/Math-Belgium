import type { Fraction } from "../../core6e/pointsDroitesRemarquablesTriangle.types";

/**
 * Couche A (6e) — fractions exactes pour `6gen54`. Certaines coordonnées ne sont PAS
 * structurellement entières (famille B : point d'une bissectrice ; famille C : solutions d'une
 * équation en valeur absolue et coordonnées du point associé) — mais elles restent toujours des
 * RATIONNELS EXACTS connus dès la génération (numérateur/dénominateur entiers, jamais approchés).
 * Ce module simplifie et affiche ces fractions "irréductibles, jamais en décimal" (convention
 * transversale, CLAUDE.md) — jamais utilisé pour la VÉRIFICATION (qui compare des `number`, avec la
 * tolérance habituelle de `diagnostiquerValeur`), seulement pour l'AFFICHAGE (blocDonnees/
 * étatActuel/aides/récapitulatif).
 */

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** Simplifie `num/den` — dénominateur toujours positif, signe porté par le numérateur. */
export function simplifier(num: number, den: number): Fraction {
  if (den === 0) throw new Error("simplifier : dénominateur nul");
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d) || 1;
  return { num: n / g, den: d / g };
}

export function versNombre(f: Fraction): number {
  return f.num / f.den;
}

/** `\frac{}{}`  si dénominateur ≠1, sinon l'entier nu — jamais de décimal. */
export function formatFractionLatex(f: Fraction): string {
  if (f.den === 1) return `${f.num}`;
  if (f.num < 0) return `-\\frac{${-f.num}}{${f.den}}`;
  return `\\frac{${f.num}}{${f.den}}`;
}
