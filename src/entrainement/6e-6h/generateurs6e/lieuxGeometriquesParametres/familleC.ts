import type { ExerciceLieuxC } from "../../core6e/lieuxGeometriquesParametres.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Cercle depuis une équation quadratique") de `6gen56`.
 * Construction "à l'envers" : `m` (coefficient commun de x² et y²), `h`,`kPrime` (valeurs ajoutées
 * dans chaque carré complété) et `R` (rayon au carré, toujours un carré parfait) sont choisis
 * D'ABORD, puis D,E,F sont recalculés pour que l'équation développée m(x²+y²)+Dx+Ey+F=0 corresponde
 * EXACTEMENT — jamais l'inverse. m(x²+y²)+Dx+Ey+F=0 ⟺ m[(x+h)²+(y+kPrime)²]=mR ⟺
 * (x+h)²+(y+kPrime)²=R, avec h=D/(2m), kPrime=E/(2m), R=h²+kPrime²-F/m — preuve par force brute
 * dans `familleC.test.ts`.
 */
export function construireFamilleC(): ExerciceLieuxC {
  const m = tirerParmi([1, 1, 2, 3] as const);
  const h = tirerEntierNonNul(1, 5);
  const kPrime = tirerEntierNonNul(1, 5);
  const r = tirerEntier(2, 6);
  const R = r * r;
  const D = 2 * m * h;
  const E = 2 * m * kPrime;
  const F = m * (h * h + kPrime * kPrime - R);
  return { famille: "C", m, D, E, F, h, kPrime, R, cx: -h, cy: -kPrime, r };
}
