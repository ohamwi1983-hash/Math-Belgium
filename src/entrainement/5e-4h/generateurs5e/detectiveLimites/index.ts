import type { ExerciceDetectiveLimites, VarianteDetectiveLimites } from "../../core5e/detectiveLimites.types";
import { LEURRES } from "../../moteur5e/modeleDetectiveLimites";

/**
 * Couche A — générateur de `5gen67` « Détective d'erreurs : limites ». `Math.random()` seul (le
 * `?code=` rejoue le tirage, ordre des descriptions et position de la ligne fausse compris). La
 * variante fixe le TYPE D'ERREUR (groupe à verdict `groupe_erreur`) ; `av` (0 à 3 lignes justes
 * avant la ligne fausse) est tiré uniformément. Nombres entiers choisis pour que l'erreur se VOIE
 * (le résultat de la copie diffère du bon) :
 * - infSurInf : a/k ≠ ±1 ; simplification : la forme « barrée » diffère de f en x = 2 ;
 * - signeZero, lateral : numérateur non nul en p ; aoAh : reste de la division non nul.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const nonNul = (a: number, b: number) => {
  for (;;) {
    const v = entier(a, b);
    if (v !== 0) return v;
  }
};
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

function donnees(v: VarianteDetectiveLimites): Record<string, number> {
  for (;;) {
    switch (v) {
      case "infSurInf": {
        const a = parmi([2, 3, 4, 5, 6, -2, -3, -4, -5]);
        const k = parmi([1, 2, 3, 4]);
        if (Math.abs(a) === k) continue;
        return { a, k, b: entier(-6, 6), c: entier(-9, 9), e: entier(1, 9) };
      }
      case "infMoinsInf":
        return { a: parmi([1, 2, 3]), b: entier(2, 9), s: parmi([1, -1]) };
      case "signeZero": {
        const a = parmi([1, 2, 3, -1, -2, -3]);
        const p = nonNul(-4, 4);
        const b = entier(-6, 6);
        const N = a * p + b;
        if (N === 0 || Math.abs(N) > 12) continue;
        return { a, b, p, side: parmi([1, -1]) };
      }
      case "simplification": {
        const a = parmi([1, 2, 3]);
        const b = nonNul(-6, 6);
        const k = parmi([1, 2, 3]);
        const c = entier(1, 9);
        if ((4 * a + 2 * b) * (k + c) === (a + 2 * b) * (4 * k + c)) continue;
        return { a, b, k, c };
      }
      case "racineMoinsInfini":
        return { m: parmi([1, 2, 3]), c: entier(1, 9), p: parmi([1, 2, 3]), q: nonNul(-6, 6) };
      case "degres":
        return { a: parmi([1, 2, 3, 4, 5, -1, -2, -3, -4]), b: entier(-6, 6), k: parmi([1, 2, 3]), e: entier(1, 9) };
      case "aoAh": {
        const a = parmi([1, 2, 3, -1, -2, -3]);
        const b = entier(-5, 5);
        const c = entier(-6, 6);
        const p = nonNul(-4, 4);
        if (c + p * (b + a * p) === 0) continue;
        return { a, b, c, p };
      }
      case "lateral": {
        const a = parmi([1, 2, -1, -2]);
        const p = nonNul(-4, 4);
        const b = entier(-6, 6);
        const N = a * p + b;
        if (N === 0 || Math.abs(N) > 12) continue;
        return { a, b, p };
      }
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveLimites; label: string }[] = [
  { id: "infSurInf", label: "« ∞/∞ = 1 »" },
  { id: "infMoinsInf", label: "« ∞ − ∞ = 0 »" },
  { id: "signeZero", label: "Signe de 0⁺ / 0⁻ faux" },
  { id: "simplification", label: "Simplification illicite (x² « barré »)" },
  { id: "racineMoinsInfini", label: "√(x²) = x en −∞" },
  { id: "degres", label: "Degrés mal comparés (x²/x³ = x)" },
  { id: "aoAh", label: "Asymptote oblique confondue avec une horizontale" },
  { id: "lateral", label: "Une seule limite latérale (la limite n'existe pas)" },
];

export function construire(variante: VarianteDetectiveLimites): ExerciceDetectiveLimites {
  const d = { ...donnees(variante), av: entier(0, 3) };
  return { variante, d, options: melanger([variante as string, ...LEURRES[variante]]) };
}

export function construireAvecVariante(id: string): ExerciceDetectiveLimites {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveLimites(): ExerciceDetectiveLimites {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
