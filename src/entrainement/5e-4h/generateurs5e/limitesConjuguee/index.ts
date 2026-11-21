import type { ExerciceConjuguee, SousFormeConjuguee, VarianteConjuguee } from "../../core5e/limitesConjuguee";

/**
 * Couche A — générateur de `5gen64` « Limites avec racines carrées : expression conjuguée ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Nombres entiers choisis pour une limite
 * exacte lisible, jamais nulle sauf en « B1 » (√(x + a) − √(x + b) → 0, résultat du cours) :
 * - A : p ∈ {1, 1, 1, 2, 3}, b ≠ 0 de −8 à 8, c de −9 à 9 ;
 * - B1 : a ≠ b de −4 à 9 (b = 0 : √x) ; B2 : a ≠ b de −6 à 6, c, d de −5 à 9 ;
 * - C : k ∈ {1, 2, 3, −1, −2}, c carré parfait (1, 4, 9, 16, 25) 70 %, sinon 2, 3, 5, 6, 7 ;
 * - D : n de 1 à 4, p de −3 à 5, a = n² − p ≠ 0, m ∈ {1, 1, 2, 3} ;
 * - E1 : m ∈ {1, 1, 2, 3}, p ∈ {±1, ±2, ±3}, q ≠ 0 ; E2 : p ∈ {1, 1, 2}, b ≠ 0.
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

const SOUS: Record<VarianteConjuguee, SousFormeConjuguee[]> = {
  diffPlus: ["A"],
  deuxRacines: ["B1", "B2"],
  zeroEnZero: ["C"],
  zeroEnA: ["D"],
  moinsInfini: ["E1", "E2"],
};

function donnees(s: SousFormeConjuguee): Record<string, number> {
  for (;;) {
    switch (s) {
      case "A":
        return { p: parmi([1, 1, 1, 2, 3]), b: nonNul(-8, 8), c: entier(-9, 9) };
      case "B1": {
        const a = entier(-4, 9);
        const b = Math.random() < 0.4 ? 0 : entier(-4, 9);
        if (a === b) continue;
        return { a, b };
      }
      case "B2": {
        const a = entier(-6, 6);
        const b = entier(-6, 6);
        if (a === b) continue;
        return { a, b, c: entier(-5, 9), d: entier(-5, 9) };
      }
      case "C":
        return { k: parmi([1, 2, 3, -1, -2]), c: Math.random() < 0.7 ? parmi([1, 4, 9, 16, 25]) : parmi([2, 3, 5, 6, 7]) };
      case "D": {
        const n = entier(1, 4);
        const p = entier(-3, 5);
        if (n * n - p === 0) continue;
        return { n, p, m: parmi([1, 1, 2, 3]) };
      }
      case "E1":
        return { m: parmi([1, 1, 2, 3]), b: entier(-6, 6), c: entier(1, 9), p: parmi([1, 2, 3, -1, -2, -3]), q: nonNul(-6, 6) };
      case "E2":
        return { p: parmi([1, 1, 2]), b: nonNul(-8, 8), c: entier(-5, 9) };
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteConjuguee; label: string }[] = [
  { id: "diffPlus", label: "∞ − ∞ en +∞ : √(p²x² + bx + c) − px" },
  { id: "deuxRacines", label: "∞ − ∞ : différence de deux racines" },
  { id: "zeroEnZero", label: "0/0 en 0 : (√(kx + c) − √c)/x" },
  { id: "zeroEnA", label: "0/0 en a : (√(x + p) − n)/(m(x − a))" },
  { id: "moinsInfini", label: "En −∞ : √(x²) = |x| = −x" },
];

export function construire(variante: VarianteConjuguee): ExerciceConjuguee {
  const sous = parmi(SOUS[variante]);
  return { variante, sous, d: donnees(sous) };
}

export function construireAvecVarianteId(id: string): ExerciceConjuguee {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceConjuguee(): ExerciceConjuguee {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
