import type { ExerciceDC, VarianteDC } from "../../core6e/detectiveConiques";
import { LEURRES } from "../../moteur6e/modeleDetectiveConiques";
import { entier, estCarreRationnel, melanger, parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen143` « Détective d'erreurs : coniques ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). La variante fixe le TYPE D'ERREUR (groupe à verdict) ; les nombres sont choisis pour
 * que l'erreur se VOIE (résultat de la copie différent du résultat juste) et que les réponses soient simples
 * (entiers, fractions courtes). L'ordre des descriptions est tiré ensuite, et la position de la ligne
 * fausse (`av`) EN DERNIER : un code imprimé rouvre les mêmes données.
 */

export const CATALOGUE_VARIANTES: { id: VarianteDC; label: string }[] = [
  { id: "hyperboleC", label: "Hyperbole : c² = a² − b² (relation de l'ellipse)" },
  { id: "secondMembre", label: "Division par un second membre négatif" },
  { id: "p2p", label: "Parabole : foyer à p au lieu de p/2" },
  { id: "deltaNul", label: "Δ = 0 lu « aucun point »" },
  { id: "demiConique", label: "Demi-ellipse prise pour l'ellipse entière" },
  { id: "brancheSigne", label: "Tangente : mauvaise branche (signe de la pente)" },
  { id: "ellipseParallele", label: "Miroir elliptique traité comme une parabole" },
  { id: "excentricite", label: "Excentricité e = a/c > 1 pour une ellipse" },
];

const PYTHA_HYP: [number, number][] = [
  [4, 3],
  [8, 6],
  [12, 5],
  [15, 8],
  [12, 9],
];
const PYTHA_ELL: [number, number, number][] = [
  [5, 4, 3],
  [5, 3, 4],
  [10, 8, 6],
  [10, 6, 8],
  [13, 12, 5],
  [13, 5, 12],
  [17, 15, 8],
  [17, 8, 15],
];
const PENTES = [1, -1, 2, -2, 1 / 2, -1 / 2, 3 / 2, -3 / 2, 2 / 3, -2 / 3, 3 / 4, -3 / 4, 4 / 3, -4 / 3];

function donnees(v: VarianteDC): Record<string, number> {
  for (;;) {
    switch (v) {
      case "hyperboleC": {
        const [a, b] = parmi(PYTHA_HYP);
        return { a, b };
      }
      case "secondMembre": {
        const A = entier(1, 5);
        const B = entier(1, 5);
        if (A === B) continue;
        return { A, B };
      }
      case "p2p":
        return { N: parmi([4, 6, 8, 10, 12, 16, 20, 24]) };
      case "deltaNul": {
        const a = entier(2, 6);
        const b = entier(1, 6);
        if (a === b) continue;
        const m = parmi(PENTES);
        const K2 = a * a * m * m + b * b;
        if (!estCarreRationnel(K2)) continue;
        const K = parmi([1, -1]) * Math.sqrt(K2);
        return { a, b, m, K };
      }
      case "demiConique": {
        const a = parmi([5, 10, 13]);
        const x0 = parmi([1, -1]) * (a === 13 ? parmi([5, 12]) : a === 5 ? parmi([3, 4]) : parmi([6, 8]));
        const b = entier(2, 9);
        if (b === a) continue;
        return { a, b, x0, s: parmi([1, -1]) };
      }
      case "brancheSigne": {
        const [h, co, si] = parmi(PYTHA_ELL);
        const k = h === 5 ? parmi([1, 2]) : 1;
        const a = k * h;
        const b = parmi([2, 3, 4, 5, 6].filter((x) => x !== a));
        return { a, b, xp: parmi([1, -1]) * (k * co), yp: -(b * si) / h };
      }
      case "ellipseParallele": {
        const [a, c, b] = parmi(PYTHA_ELL);
        const [co, si] = parmi([
          [3 / 5, 4 / 5],
          [4 / 5, 3 / 5],
        ] as const);
        const xp = parmi([1, -1]) * a * co;
        if (Math.abs(xp - c) < 1e-9) continue;
        return { a, b, c, xp, yp: parmi([1, -1]) * b * si };
      }
      case "excentricite": {
        const [a, c, b] = parmi(PYTHA_ELL);
        return { a, b, c };
      }
    }
  }
}

export function construire(variante: VarianteDC): ExerciceDC {
  const d = donnees(variante);
  const options = melanger([variante as string, ...LEURRES[variante]]);
  return { variante, d: { ...d, av: entier(0, 3) }, options };
}

export function construireAvecVariante(id: string): ExerciceDC {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDC(): ExerciceDC {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
