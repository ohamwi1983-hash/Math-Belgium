import type { ExerciceFamilleC } from "../../core6e/affixesRacines.types";
import { tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — famille C (« Racines carrées d'un nombre complexe ») de `6gen35`, méthode du cours :
 * (x+yi)² = a+bi ⇔ x²−y² = a, 2xy = b, x²+y² = |a+bi|. x, y non nuls de [-5 ; 5] ; cas particulier
 * (~10 %) : |x| = |y|, soit a = 0 (a+bi imaginaire pur).
 */

const XY_MAX = 5;
const PROBABILITE_CAS_PARTICULIER = 0.1;

export function construireFamilleC(): ExerciceFamilleC {
  const x = tirerEntierNonNul(-XY_MAX, XY_MAX);
  let y: number;
  if (Math.random() < PROBABILITE_CAS_PARTICULIER) y = Math.random() < 0.5 ? x : -x;
  else {
    do y = tirerEntierNonNul(-XY_MAX, XY_MAX);
    while (Math.abs(y) === Math.abs(x));
  }
  const a = x * x - y * y;
  const b = 2 * x * y;
  const xPositif = Math.abs(x);
  const yDeduit = b / (2 * xPositif);
  const racines: [{ re: number; im: number }, { re: number; im: number }] = [
    { re: xPositif, im: yDeduit },
    { re: -xPositif, im: -yDeduit },
  ];
  return { famille: "C", x, y, a, b, xPositif, yDeduit, racines, module: x * x + y * y };
}
