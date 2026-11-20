import type { ExerciceDetectiveFonctions, ScenarioDetectiveFonctions, VarianteDetectiveFonctions } from "../../core5e/detectiveFonctions.types";
import { DESCRIPTION_CORRECTE, LEURRES } from "../../moteur5e/modeleDetectiveFonctions";

/**
 * Couche A — générateur de `5gen58` « Détective d'erreurs : fonctions et composées ». `Math.random()`
 * seul (le `?code=` rejoue le tirage, ordre des descriptions compris). La variante fixe le TYPE
 * D'ERREUR (= réponse de l'écran 2 : groupe à verdict `groupe_erreur`) ; « condition2 » a deux
 * scénarios (condition 2 oubliée / domaine lu sur la formule simplifiée). Nombres entiers choisis
 * pour que l'erreur se VOIE (le résultat de la copie diffère du bon) :
 * - sens : √(c − kx), k de 2 à 5, c > 0 (c/k entier 70 %) ;
 * - strict : n/√(kx + p), k de 1 à 3, p ≠ 0 ;
 * - union : √(x − a) + √(b − x), a < b ; domaine vide (b < a) 10 % — CAS PARTICULIER ;
 * - condition2 : 1/(x − k) ∘ √(x + p) (C1) ou x² ∘ √(±(x − p)) (C2) ;
 * - ordre : x² + c et mx + q, (f∘g)(x) ou (g∘f)(x) demandé ;
 * - portion : (g∘f)(a) avec g(x) = x² − c définie sur ℝ, tracée de −4 à 4, f(a) hors de [−4 ; 4].
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

export const PART_DOMAINE_VIDE = 0.1;

const SCENARIOS: Record<VarianteDetectiveFonctions, ScenarioDetectiveFonctions[]> = {
  sens: ["S"],
  strict: ["T"],
  union: ["U"],
  condition2: ["C1", "C2"],
  ordre: ["O"],
  portion: ["P"],
};

function donnees(s: ScenarioDetectiveFonctions, vide?: boolean): Record<string, number> {
  for (;;) {
    switch (s) {
      case "S": {
        const k = entier(2, 5);
        const c = Math.random() < 0.7 ? k * entier(1, 4) : entier(1, 12);
        if (c / k > 6) continue;
        return { k, c, o: entier(0, 1) };
      }
      case "T": {
        const p = entier(-8, 8);
        if (p === 0) continue;
        return { k: parmi([1, 1, 2, 3]), p, n: parmi([1, 2, 3, 5]) };
      }
      case "U": {
        const estVide = vide ?? Math.random() < PART_DOMAINE_VIDE;
        const a = entier(-5, 4);
        const b = estVide ? a - entier(1, 4) : a + entier(2, 7);
        if (b < -6 || b > 8 || a === 0) continue;
        return { a, b };
      }
      case "C1": {
        const k = entier(1, 4);
        const p = entier(-5, 5);
        if (k * k - p > 20) continue;
        return { k, p };
      }
      case "C2": {
        const p = entier(-5, 5);
        if (p === 0) continue;
        return { p, s: Math.random() < 0.65 ? 1 : -1 };
      }
      case "O": {
        const c = entier(-5, 5);
        const q = entier(-5, 5);
        if (c === 0 || q === 0) continue;
        return { c, m: parmi([2, 3, -2, -3]), q, t: entier(0, 1) };
      }
      case "P": {
        const m = parmi([2, 3]);
        const q = entier(-3, 3);
        const a = parmi([-4, -3, 2, 3, 4]);
        const fa = m * a + q;
        if (Math.abs(fa) < 5 || Math.abs(fa) > 12) continue;
        return { m, q, c: entier(1, 9), a };
      }
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveFonctions; label: string }[] = [
  { id: "sens", label: "Sens de l'inégalité non inversé (√(c − kx))" },
  { id: "strict", label: "« ≥ » au lieu de « > » (racine au dénominateur)" },
  { id: "union", label: "Réunion au lieu d'intersection (deux racines)" },
  { id: "condition2", label: "Condition 2 oubliée ou domaine lu après simplification" },
  { id: "ordre", label: "f∘g et g∘f inversés" },
  { id: "portion", label: "« N'existe pas » au lieu de « hors de la portion tracée »" },
];

export function construire(variante: VarianteDetectiveFonctions, vide?: boolean): ExerciceDetectiveFonctions {
  const scenario = parmi(SCENARIOS[variante]);
  return { variante, scenario, d: donnees(scenario, vide), options: melanger([DESCRIPTION_CORRECTE[variante], ...LEURRES[variante]]) };
}

export function construireAvecVariante(id: string): ExerciceDetectiveFonctions {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveFonctions(): ExerciceDetectiveFonctions {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
