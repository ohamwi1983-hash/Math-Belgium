import type { ExerciceDL, VarianteDL } from "../../core6e/detectiveLieux";
import { aireDonnees, LEURRES } from "../../moteur6e/modeleDetectiveLieux";
import { entier, melanger, nonNul, parmi } from "../../ui6e/outilsLieuxLotH2";

/**
 * Couche A — générateur de `6gen131` « Détective d'erreurs : lieux, droites et cercles ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). La variante fixe le TYPE D'ERREUR (groupe à
 * verdict) ; les nombres sont choisis pour que l'erreur se VOIE (résultat de la copie différent du
 * résultat juste) et que les réponses soient simples (entiers, fractions courtes, racines). L'ordre des
 * descriptions est tiré ensuite, et la position de la ligne fausse (`av`) EN DERNIER : un code imprimé
 * rouvre les mêmes données.
 */

export const CATALOGUE_VARIANTES: { id: VarianteDL; label: string }[] = [
  { id: "losange", label: "Losange : sommets en (p ± k ; q ± k)" },
  { id: "mediane", label: "Théorème de la médiane : « / 2 » oublié" },
  { id: "apollonius", label: "Apollonius : division par 1 − k pour k = 1" },
  { id: "centreM", label: "Centre d'un cercle : division par m oubliée" },
  { id: "incentre", label: "Incentre pris comme moyenne des sommets" },
  { id: "aire", label: "Aire variable : une seule solution" },
  { id: "tangente", label: "Tangente verticale oubliée" },
  { id: "restriction", label: "Thalès : points exclus oubliés" },
];

const COUPLES_MEDIANE: [number, number][] = [
  [2, 0],
  [0, 2],
  [1, 1],
  [2, 2],
  [1, 3],
  [3, 1],
  [-2, 2],
  [3, -1],
];

function donnees(v: VarianteDL): Record<string, number> {
  for (;;) {
    switch (v) {
      case "losange":
        return { p: entier(-3, 3), q: entier(-3, 3), k: entier(2, 5) };
      case "mediane": {
        const [dx, dy] = parmi(COUPLES_MEDIANE);
        const D = dx * dx + dy * dy;
        const r2 = parmi([2, 4, 5, 8, 9, 10, 13, 16]);
        if (r2 - D / 4 < 1) continue;
        return { xA: entier(-3, 2), yA: entier(-3, 2), dx, dy, r2 };
      }
      case "apollonius":
      case "restriction": {
        const xA = entier(-4, 2);
        const yA = entier(-3, 2);
        const xB = xA + parmi([-1, 1]) * entier(2, 5);
        const yB = yA + entier(-4, 4);
        const ab2 = (xB - xA) ** 2 + (yB - yA) ** 2;
        if (ab2 < 8 || Math.abs(xB) > 6 || Math.abs(yB) > 6) continue;
        return { xA, yA, xB, yB };
      }
      case "centreM": {
        const u = entier(-3, 3);
        const vv = entier(-3, 3);
        if (u === 0 && vv === 0) continue;
        return { m: parmi([2, 3, 4]), u, v: vv, r2: parmi([1, 2, 4, 5, 9]) };
      }
      case "incentre": {
        const [p, q] = parmi([
          [3, 4],
          [4, 3],
          [6, 8],
          [8, 6],
        ] as const);
        const sx = parmi([1, -1]);
        const sy = parmi([1, -1]);
        const xC = sx > 0 ? entier(-4, 0) : entier(0, 4);
        const yC = sy > 0 ? entier(-4, 0) : entier(0, 4);
        if (Math.abs(xC + sx * p) > 8 || Math.abs(yC + sy * q) > 8) continue;
        return { xC, yC, p, q, sx, sy };
      }
      case "aire": {
        const xA = entier(-3, 2);
        const yA = entier(-3, 2);
        const xB = xA + nonNul(-4, 4);
        const yB = yA + entier(-3, 3);
        const al = parmi([-2, -1, 1, 2]);
        const be = entier(-3, 3);
        const S = entier(2, 15);
        const a = aireDonnees({ xA, yA, xB, yB, al, be, S });
        if (a.M === 0) continue;
        if (!Number.isInteger(a.t1) || !Number.isInteger(a.t2) || Math.abs(a.t1) > 6 || Math.abs(a.t2) > 6) continue;
        // C sur (AB) pour aucune des deux solutions (aire non nulle par construction).
        return { xA, yA, xB, yB, al, be, S };
      }
      case "tangente": {
        const r = entier(2, 5);
        const h = parmi([1, -1]) * entier(1, 6);
        const m = (h * h - r * r) / (2 * r * h);
        if (Math.abs(m * 12 - Math.round(m * 12)) > 1e-9 && Math.abs(m * 2 * r * h - Math.round(m * 2 * r * h)) > 1e-9) continue;
        if (Math.abs(m) > 4) continue;
        return { a: entier(-3, 2), b: entier(-3, 2), r, h };
      }
    }
  }
}

export function construire(variante: VarianteDL): ExerciceDL {
  const d = donnees(variante);
  const options = melanger([variante as string, ...LEURRES[variante]]);
  return { variante, d: { ...d, av: entier(0, 3) }, options };
}

export function construireAvecVariante(id: string): ExerciceDL {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDL(): ExerciceDL {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
