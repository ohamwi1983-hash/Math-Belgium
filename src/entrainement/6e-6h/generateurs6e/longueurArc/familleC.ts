import type { ExerciceLongueurArcC } from "../../core6e/longueurArc.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Cas simple, substitution directe") de `6gen28`.
 * f(x)=x^(3/2), f'(x)=(3/2)√x, f'(x)²=(9/4)x — 1+f'(x)² = 1+(9/4)x est AFFINE en x, PAS un carré
 * parfait : contraste EXPLICITE avec la famille A (spec), voir en-tête `core6e/longueurArc.types.ts`.
 *
 * Primitive de √(1+(9/4)x) par substitution u=1+(9/4)x, du=(9/4)dx :
 * ∫√u · (4/9)du = (4/9)·(2/3)u^(3/2) = (8/27)u^(3/2), d'où (8/27)(1+(9/4)x)^(3/2).
 */

function tirerBornesDistinctesOrdonnees(): [number, number] {
  let a = tirerEntier(1, 4);
  let b = tirerEntier(1, 4);
  while (b === a) b = tirerEntier(1, 4);
  return a < b ? [a, b] : [b, a];
}

export function construireFamilleLongueurArcC(): ExerciceLongueurArcC {
  const [a, b] = tirerBornesDistinctesOrdonnees();
  return {
    famille: "C",
    a,
    b,
    unPlusFPrimeCarreReference: (x) => 1 + 2.25 * x,
    primitiveReference: (x) => (8 / 27) * Math.pow(1 + 2.25 * x, 1.5),
  };
}
