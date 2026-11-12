import type { ExerciceFamilleD } from "../../core6e/affixesRacines.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — famille D (« Milieu et distance ») de `6gen35`, ajoutée par l'audit 6e ch. 5
 * (point 21). A à coordonnées entières de [-5 ; 5] ; le vecteur AB est tiré parmi des triplets
 * pythagoriciens (AB entier, aucune racine à laisser) avec signes et ordre des composantes
 * aléatoires ; cas particulier (~10 %) : AB horizontal ou vertical.
 */

const TRIPLETS: readonly [number, number][] = [
  [3, 4],
  [6, 8],
  [5, 12],
  [8, 6],
  [4, 3],
  [12, 5],
];
const COORD_MAX = 5;
const B_MAX = 9;
const PROBABILITE_CAS_PARTICULIER = 0.1;

export function construireFamilleD(): ExerciceFamilleD {
  for (;;) {
    let dx: number;
    let dy: number;
    if (Math.random() < PROBABILITE_CAS_PARTICULIER) {
      const longueur = tirerEntier(2, 8);
      [dx, dy] = Math.random() < 0.5 ? [longueur, 0] : [0, longueur];
    } else [dx, dy] = tirerParmi(TRIPLETS);
    if (Math.random() < 0.5) dx = -dx;
    if (Math.random() < 0.5) dy = -dy;
    const zA = { re: tirerEntier(-COORD_MAX, COORD_MAX), im: tirerEntier(-COORD_MAX, COORD_MAX) };
    const zB = { re: zA.re + dx, im: zA.im + dy };
    if (Math.abs(zB.re) > B_MAX || Math.abs(zB.im) > B_MAX) continue;
    return {
      famille: "D",
      zA,
      zB,
      milieu: { re: (zA.re + zB.re) / 2, im: (zA.im + zB.im) / 2 },
      difference: { re: dx, im: dy },
      distance: Math.hypot(dx, dy),
    };
  }
}
