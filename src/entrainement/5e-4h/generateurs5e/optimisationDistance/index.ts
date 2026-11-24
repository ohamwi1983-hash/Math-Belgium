import type { ExerciceOptimisationDistance, VarianteOptimisationDistance } from "../../core5e/optimisationDistance";
import { TRIPLETS, VITESSES } from "../../core5e/optimisationDistance";

/**
 * Couche A — générateur de `5gen71` « Optimisation : distance et temps minimaux ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Le verdict « optimum à la borne » (pointRacine, sauveteur)
 * est tiré AVANT les nombres (`PROBA_BORNE`), pour que sa fréquence ne dépende pas des rejets.
 */

export const PROBA_BORNE = 0.25;

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function donnees(v: VarianteOptimisationDistance): Record<string, number> {
  switch (v) {
    case "pointRacine": {
      const dehors = Math.random() < PROBA_BORNE;
      const k = parmi([1, 2, 4, 6]);
      if (!dehors) {
        const base = Math.floor(k / 2);
        return { k, a: entier(base + 1, base + 6), dehors: 0 };
      }
      const candidats = [-3, -2, -1, 1, 2].filter((a) => 2 * a - k < 0);
      return { k, a: parmi(candidats), dehors: 1 };
    }
    case "pointHyperbole":
      return { k: parmi([1, 2, 3, 4, 5, 6, 8, 9]) };
    case "sauveteur": {
      const dehors = Math.random() < PROBA_BORNE;
      const s = entier(0, VITESSES.length - 1);
      const V = VITESSES[s]!;
      const js = [1, 2, 3, 4, 5, 6].filter((j) => V.den * j >= 20 && V.den * j <= 80);
      const j = parmi(js);
      const h = V.den * j;
      const u = V.num * j;
      if (!dehors) {
        const L = 5 * entier(Math.ceil((u + 10) / 5), Math.floor((u + 80) / 5));
        return { s, h, L, dehors: 0 };
      }
      const L = entier(Math.max(5, Math.ceil(u / 2)), u - 3);
      return { s, h, L, dehors: 1 };
    }
    case "cable": {
      for (;;) {
        const T = parmi(TRIPLETS);
        const c = entier(T.cMin, T.cMax);
        const L = T.p * c;
        const somme = T.q * c;
        const js: number[] = [];
        for (let j = 1; T.q * j < somme; j++) {
          const a = T.q * j;
          if (a >= 0.2 * somme && a <= 0.8 * somme && 2 * a !== somme) js.push(j);
        }
        if (js.length === 0) continue;
        const a = T.q * parmi(js);
        return { L, a, b: somme - a, r: T.r * c };
      }
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteOptimisationDistance; label: string }[] = [
  { id: "pointRacine", label: "Point de y = √(kx) le plus proche d'un point de l'axe" },
  { id: "pointHyperbole", label: "Point de y = k/x le plus proche de l'origine" },
  { id: "sauveteur", label: "Sauveteur : course puis nage (temps minimal)" },
  { id: "cable", label: "Câble passant par la rive (longueur minimale)" },
];

export function construire(variante: VarianteOptimisationDistance): ExerciceOptimisationDistance {
  return { variante, d: donnees(variante) };
}

export function construireAvecVariante(id: string): ExerciceOptimisationDistance {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceOptimisationDistance(): ExerciceOptimisationDistance {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
