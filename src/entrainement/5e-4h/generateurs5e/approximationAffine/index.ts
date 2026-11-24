import type { ExerciceApproximationAffine, FonctionApproximation, VarianteApproximationAffine } from "../../core5e/approximationAffine";
import { erreur, valeurExacte } from "../../core5e/approximationAffine";

/**
 * Couche A — générateur de `5gen68` « Approximation affine ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Le SIGNE de h est tiré AVANT la boucle de rejet (moitié des exercices avec
 * h < 0 : le piège « h négatif » n'est jamais biaisé par le rejet). Rejet : erreur commise
 * < 2·10⁻⁶ (la valeur de la calculatrice, à 9 décimales, n'en donnerait plus trois chiffres) ou
 * > 0,4 % de la valeur (l'approximation ne serait plus crédible : 1,03⁶ ≈ 1,18 pour 1,194).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}

const CENTIEMES = [0.01, 0.02, 0.03, 0.04, 0.05];

function tirer(variante: VarianteApproximationAffine, signe: number): ExerciceApproximationAffine {
  const base = { variante, n: 1, aPi: 0, contexte: null as ExerciceApproximationAffine["contexte"] };
  switch (variante) {
    case "racine": {
      const a = parmi([1, 4, 16, 25]);
      const h = signe * parmi(a <= 4 ? [...CENTIEMES, 0.06, 0.08, 0.1] : [...CENTIEMES, 0.1, 0.2, 0.3]);
      return { ...base, fn: "racine", a, h };
    }
    case "puissance": {
      const a = parmi([1, 1, 2, 10]);
      const n = a === 1 ? parmi([2, 3, 4, 5, 6]) : a === 2 ? parmi([2, 3, 4]) : parmi([2, 3]);
      return { ...base, fn: "puissance", a, n, h: signe * parmi(CENTIEMES) };
    }
    case "inverse": {
      const a = parmi([1, 2, 4, 5, 10]);
      const h = signe * parmi(a >= 4 ? [...CENTIEMES, 0.1, 0.2] : CENTIEMES);
      return { ...base, fn: "inverse", a, h };
    }
    case "trigo": {
      const [fn, aPi] = parmi<[FonctionApproximation, number]>([
        ["sin", 0],
        ["tan", 0],
        ["sin", 1],
        ["cos", 0.5],
      ]);
      return { ...base, fn, aPi, a: aPi * Math.PI, h: signe * parmi([0.05, 0.1, 0.15, 0.2]) };
    }
    case "contexte": {
      if (Math.random() < 0.5) return { ...base, fn: "puissance", n: 3, contexte: "cube", a: parmi([2, 3, 4, 5, 6, 8, 10]), h: signe * parmi(CENTIEMES) };
      return { ...base, fn: "puissance", n: 2, contexte: "carre", a: parmi([10, 12, 15, 20, 25, 30, 40, 50]), h: signe * parmi([0.1, 0.2, 0.3, 0.5]) };
    }
  }
}

export function construire(variante: VarianteApproximationAffine): ExerciceApproximationAffine {
  const signe = Math.random() < 0.5 ? -1 : 1;
  for (;;) {
    const e = tirer(variante, signe);
    const err = erreur(e);
    // Approximation crédible : erreur ≤ 0,4 % de la valeur (au moins 0,004 en absolu).
    if (err >= 2e-6 && err <= 0.004 * Math.max(1, Math.abs(valeurExacte(e)))) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteApproximationAffine; label: string }[] = [
  { id: "racine", label: "√N près d'un carré parfait" },
  { id: "puissance", label: "Puissance Nⁿ près de 1, 2 ou 10" },
  { id: "inverse", label: "Inverse 1/N" },
  { id: "trigo", label: "sin, cos, tan près de 0, π/2 ou π (radians)" },
  { id: "contexte", label: "En contexte : cube ou plaque qui se dilate" },
];

export function construireAvecVarianteId(id: string): ExerciceApproximationAffine {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceApproximationAffine(): ExerciceApproximationAffine {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
