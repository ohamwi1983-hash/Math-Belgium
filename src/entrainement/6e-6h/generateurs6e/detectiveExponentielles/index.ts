import type { ExerciceDetectiveExp, ScenarioDetectiveExp, VarianteDetectiveExp } from "../../core6e/detectiveExponentielles.types";
import { BASES_DOMINANCE, BASES_SENS, CONTEXTES_BAISSE, DESCRIPTION_CORRECTE, LEURRES } from "../../moteur6e/modeleDetectiveExponentielles";
import { entier, estDecimal, melanger, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de 6gen144 « Le détective d'erreurs : exponentielles ». `Math.random()` seul
 * (le `?code=` rejoue le tirage, ordre des descriptions compris). La variante fixe le type d'erreur
 * (= la réponse de l'écran 2 : groupe à verdict de l'adaptateur) ; `regles` et `dominance` ont deux
 * scénarios chacun. Nombres tirés pour que toute valeur imprimée soit exacte et lisible.
 */

export type IdVarianteDetectiveExp = VarianteDetectiveExp;

export const CATALOGUE_VARIANTES: { id: IdVarianteDetectiveExp; label: string }[] = [
  { id: "lnA", label: "Facteur ln a oublié dans la dérivée de aᵘ" },
  { id: "signe", label: "Signe de e^(−kx) perdu en dérivant" },
  { id: "sens", label: "Base entre 0 et 1 : sens de l'inégalité conservé" },
  { id: "racine", label: "Racine t < 0 gardée après t = aˣ" },
  { id: "regles", label: "Règles des puissances mal appliquées" },
  { id: "dominance", label: "Dominance renversée (xⁿ « l'emporte »)" },
  { id: "croissance", label: "Baisse de p % modélisée par r = 1 + p" },
  { id: "rapport", label: "Facteur a pris comme une différence" },
];

const SCENARIOS: Record<VarianteDetectiveExp, ScenarioDetectiveExp[]> = {
  lnA: ["L"],
  signe: ["S"],
  sens: ["I"],
  racine: ["R"],
  regles: ["P1", "P2"],
  dominance: ["D1", "D2"],
  croissance: ["C"],
  rapport: ["T"],
};

const Q0_BAISSE = [
  [12000, 15000, 18000, 20000, 24000, 25000, 30000],
  [50, 80, 100, 120, 200, 250, 400, 500],
  [1000, 2000, 4000, 5000, 8000, 10000],
];

/** Plus petite valeur « ronde » de x où la dominance se voit déjà nettement. */
function xTest(scenario: ScenarioDetectiveExp, a: number, n: number): number {
  for (const X of [10, 20, 50, 100, 200, 500, 1000, 2000]) {
    if (scenario === "D1" && X ** n / a ** X < 1e-3) return X;
    if (scenario === "D2" && a ** X > 1000 * X ** n) return X;
  }
  return 2000;
}

function donnees(scenario: ScenarioDetectiveExp): Record<string, number> {
  for (;;) {
    switch (scenario) {
      case "L":
        return { c: entier(2, 5), a: parmi([2, 3, 5, 10]), m: parmi([2, 3, -2, -3]), x0: parmi([-1, 0, 1, 2]) };
      case "S":
        return { c: entier(2, 6), k: entier(2, 5), d: parmi([0, 1, 2, 3, -1, -2]) };
      case "I": {
        // m − n ≥ 2 : la ligne 4 de la copie divise vraiment (jamais « 1x »).
        const m = entier(3, 6);
        const n = entier(1, m - 2);
        const p = entier(-5, 5);
        const q = entier(-5, 5);
        if (q === p) continue;
        return { base: entier(0, BASES_SENS.length - 1), s: entier(0, 3), m, n, p, q };
      }
      case "R": {
        const a = parmi([2, 3]);
        const k = entier(0, 2);
        const j = a === 2 ? entier(1, 3) : entier(1, 2);
        if (j === k) continue;
        return { a, k, j };
      }
      case "P1": {
        const m = entier(1, 3);
        const n = entier(1, 5);
        if (n === m || n === 2 * m) continue;
        const p = entier(-3, 3);
        const q = entier(-4, 6);
        const rw = (q - p - 2) / (m - n);
        const rj = (q - 2 * p) / (2 * m - n);
        if (Math.abs(rw - rj) < 1e-9 || Math.abs(rj) > 20) continue;
        return { a: parmi([2, 3, 5]), m, n, p, q };
      }
      case "P2": {
        const r1 = parmi([-4, -3, -2, -1, 1, 2, 3, 4]);
        const r2 = parmi([-4, -3, -2, -1, 1, 2, 3, 4]);
        if (r1 === r2 || r1 === -r2) continue;
        const x = (-r1 * r2 + (r1 + r2)) / 2;
        if (x === r1 || x === r2) continue;
        return { a: parmi([0, 2, 3, 5]), r1, r2 };
      }
      case "D1":
      case "D2": {
        const base = entier(0, BASES_DOMINANCE.length - 1);
        const n = parmi([3, 4, 5, 10, 20]);
        return { base, n, X: xTest(scenario, BASES_DOMINANCE[base].v, n) };
      }
      case "C": {
        const ctx = entier(0, CONTEXTES_BAISSE.length - 1);
        const p = parmi([5, 10, 15, 20, 25, 30, 40]);
        const n = parmi([2, 3]);
        const Q0 = parmi(Q0_BAISSE[ctx]);
        const dec = CONTEXTES_BAISSE[ctx].decimales;
        const v = Q0 * (1 - p / 100) ** n;
        const vf = Q0 * (1 + p / 100) ** n;
        if (!estDecimal(v, dec) || !estDecimal(vf, Math.max(dec, 2))) continue;
        return { ctx, p, Q0, n };
      }
      case "T": {
        const [an, ad] = parmi([
          [3, 2],
          [2, 1],
          [5, 4],
          [6, 5],
        ]);
        const b = parmi([100, 200, 400, 500, 800, 1000]);
        const T = parmi([4, 5]);
        if (![1, 2, 3].every((k) => estDecimal(b * (an / ad) ** k, 4)) || !estDecimal(b * (an / ad) ** T, 6)) continue;
        return { b, an, ad, T };
      }
    }
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveExp {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "lnA") as VarianteDetectiveExp;
  const scenario = parmi(SCENARIOS[variante]);
  return { variante, scenario, donnees: donnees(scenario), options: melanger([DESCRIPTION_CORRECTE[variante], ...LEURRES[variante]]) };
}

export function genererExerciceDetectiveExp(): ExerciceDetectiveExp {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
