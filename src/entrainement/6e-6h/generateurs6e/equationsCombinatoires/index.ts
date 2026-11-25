import type { Exercice101, Variante101 } from "../../core6e/equationsCombinatoires";

/**
 * Couche A — générateur de `6gen101` « Factorielles et équations combinatoires ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). On tire d'abord la solution admissible m, puis le second
 * membre V = P(m) : les deux racines sont entières, l'autre est toujours négative (à rejeter).
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const base = { V: 0, s: 0, inconnue: "n" as const, p: 0, q: 0 };

function tirer(variante: Variante101): Exercice101 {
  switch (variante) {
    case "quotient": {
      const s = parmi([-1, 0, 1, 2]);
      const m = entier(4, 12);
      // (n+s)(n+s−1) = V avec n + s = m.
      return { ...base, variante, s, sol: m - s, V: m * (m - 1) };
    }
    case "arrangement": {
      const m = entier(5, 16);
      return { ...base, variante, sol: m, V: m * (m - 1) };
    }
    case "combinaison": {
      const m = entier(5, 20);
      return { ...base, variante, sol: m, V: (m * (m - 1)) / 2 };
    }
    case "mixte": {
      const m = entier(4, 16);
      return { ...base, variante, sol: m, V: (m * (m + 1)) / 2 };
    }
    case "symetrie": {
      if (Math.random() < 0.5) {
        const p = entier(2, 5);
        const q = p + entier(1, 4);
        return { ...base, variante, inconnue: "n", p, q, sol: p + q };
      }
      const d = entier(1, 4);
      const k = entier(2, 7);
      return { ...base, variante, inconnue: "k", p: 2 * k + d, q: d, sol: k };
    }
  }
}

export const CATALOGUE_101: { id: Variante101; label: string }[] = [
  { id: "quotient", label: "Quotient de factorielles = nombre" },
  { id: "arrangement", label: "Arrangement Aₙ² = nombre" },
  { id: "combinaison", label: "Combinaison Cₙ² = nombre" },
  { id: "mixte", label: "Cₙ² + n = nombre" },
  { id: "symetrie", label: "Symétrie : Cₙᵖ = Cₙ^q (inconnue en haut ou en bas)" },
];

export function construireAvecVariante101(id: string): Exercice101 {
  const v = CATALOGUE_101.find((x) => x.id === id);
  return tirer(v ? v.id : parmi(CATALOGUE_101).id);
}

export function genererExercice101(): Exercice101 {
  return tirer(parmi(CATALOGUE_101).id);
}
