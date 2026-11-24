import type { ExerciceDetectiveDerivees, VarianteDetectiveDerivees } from "../../core5e/detectiveDerivees.types";
import { LEURRES } from "../../moteur5e/modeleDetectiveDerivees";

/**
 * Couche A — générateur de `5gen72` « Détective d'erreurs : dérivées ». `Math.random()` seul (le
 * `?code=` rejoue le tirage, ordre des descriptions et position de la ligne fausse compris). La
 * variante fixe le TYPE D'ERREUR (groupes à verdict) ; `av` (0 à 3 lignes justes avant la ligne
 * fausse) est tiré uniformément. Nombres entiers choisis pour que l'erreur se VOIE (la tangente ou
 * les extremums de la copie diffèrent des bons) et que les valeurs restent petites (|f(a)| ≤ 40,
 * pente ≤ 40, dénominateurs 1, 2 ou 4).
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
const A_TANGENTE = [-2, -1, 1, 2];

function donnees(v: VarianteDetectiveDerivees): Record<string, number> {
  for (;;) {
    switch (v) {
      case "produit": {
        const c = parmi([1, 2, 3, -1, -2]);
        const p = nonNul(-5, 5);
        const r = nonNul(-4, 4);
        const a = parmi(A_TANGENTE);
        const fa = (a * a + p) * (c * a + r);
        const m = 3 * c * a * a + 2 * r * a + c * p;
        if (m === 0 || m === 2 * c * a || Math.abs(fa) > 40 || Math.abs(m) > 40) continue;
        return { c, p, r, a };
      }
      case "quotient": {
        const c = parmi([1, 2, 3, -1, -2]);
        const dd = entier(-6, 6);
        const ee = nonNul(-4, 4);
        const a = parmi(A_TANGENTE);
        const den = a + ee;
        if (![-2, -1, 1, 2].includes(den) || c * ee - dd === 0 || Math.abs(c * ee - dd) > 12) continue;
        return { c, dd, ee, a };
      }
      case "chaine": {
        const n = parmi([2, 3]);
        const c = parmi([2, 3, -2, -3]);
        const a = parmi(A_TANGENTE);
        const w = parmi([-2, -1, 1, 2]);
        const dd = w - c * a;
        if (dd === 0 || Math.abs(dd) > 8 || Math.abs(n * c * w ** (n - 1)) > 40) continue;
        return { n, c, dd, a };
      }
      case "inverse": {
        const alpha = parmi([1, 2, 3, -1, -2]);
        const k = nonNul(-6, 6);
        const a = parmi(A_TANGENTE);
        if (2 * alpha * a * a * a === k) continue; // pente nulle : tangente horizontale, exclue
        return { alpha, k, a };
      }
      case "formuleTangente": {
        const alpha = parmi([1, 2, 3, -1, -2]);
        const beta = nonNul(-5, 5);
        const gamma = entier(-6, 6);
        const a = parmi([-2, -1, 1, 2, 3]);
        const m = 2 * alpha * a + beta;
        const fa = alpha * a * a + beta * a + gamma;
        if (m === 0 || Math.abs(fa) > 40) continue;
        return { alpha, beta, gamma, a };
      }
      case "signeTrinome": {
        const r1 = entier(-3, 3);
        const r2 = entier(r1 + 1, 4);
        return { r1, r2, alpha: parmi([1, -1]), delta: entier(-5, 5) };
      }
      case "racineOubliee":
        return { k: parmi([1, 2, 3]), alpha: parmi([1, -1]), delta: entier(-5, 5) };
      case "sansChangement":
        return { m: parmi([-3, -2, -1, 1, 2, 3]), alpha: parmi([1, -1]), delta: entier(-5, 5) };
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveDerivees; label: string }[] = [
  { id: "produit", label: "Tangente — « (uv)′ = u′v′ »" },
  { id: "quotient", label: "Tangente — quotient, numérateur inversé" },
  { id: "chaine", label: "Tangente — chaîne, dérivée de l'intérieur oubliée" },
  { id: "inverse", label: "Tangente — « (1/x)′ = 1/x² »" },
  { id: "formuleTangente", label: "Tangente — « y = f′(a)x + f(a) »" },
  { id: "signeTrinome", label: "Extremums — signe du trinôme f′ inversé" },
  { id: "racineOubliee", label: "Extremums — « x² = k² ⇒ x = k »" },
  { id: "sansChangement", label: "Extremums — zéro de f′ sans changement de signe" },
];

export function construire(variante: VarianteDetectiveDerivees): ExerciceDetectiveDerivees {
  const d = { ...donnees(variante), av: entier(0, 3) };
  return { variante, d, options: melanger([variante as string, ...LEURRES[variante]]) };
}

export function construireAvecVariante(id: string): ExerciceDetectiveDerivees {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveDerivees(): ExerciceDetectiveDerivees {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
