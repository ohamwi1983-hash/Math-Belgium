import type { ExerciceFamilleB } from "../../core6e/affixesRacines.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — famille B (« Parallélogramme via affixes ») de `6gen35`. A, B, C à coordonnées
 * ENTIÈRES de [-5 ; 5] (avant : demi-entières, d'où des affixes en ½ difficiles à lire), jamais
 * alignés (sinon ABCD est aplati), et D = A − B + C reste dans [-8 ; 8]². Les champs `*2` gardent
 * leur convention historique (coordonnée × 2) pour ne pas toucher au format ni à l'export.
 */

const COORD_MAX = 5;
const D_MAX = 8;

export function construireFamilleB(): ExerciceFamilleB {
  for (;;) {
    const xA = tirerEntier(-COORD_MAX, COORD_MAX);
    const yA = tirerEntier(-COORD_MAX, COORD_MAX);
    const xB = tirerEntier(-COORD_MAX, COORD_MAX);
    const yB = tirerEntier(-COORD_MAX, COORD_MAX);
    const xC = tirerEntier(-COORD_MAX, COORD_MAX);
    const yC = tirerEntier(-COORD_MAX, COORD_MAX);
    const aire2 = (xB - xA) * (yC - yA) - (yB - yA) * (xC - xA);
    if (aire2 === 0) continue; // alignés (ou confondus)
    const xD = xA - xB + xC;
    const yD = yA - yB + yC;
    if (Math.abs(xD) > D_MAX || Math.abs(yD) > D_MAX) continue;
    return { famille: "B", reA2: 2 * xA, imA2: 2 * yA, reB2: 2 * xB, imB2: 2 * yB, reC2: 2 * xC, imC2: 2 * yC, reD2: 2 * xD, imD2: 2 * yD };
  }
}
