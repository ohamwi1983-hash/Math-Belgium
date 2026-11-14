import type {
  ExerciceBenefice,
  ExerciceCoutMoyen,
  ExerciceDebit,
  ExerciceEngrais,
  ExerciceOptimiserLog,
  ExerciceRendementMoyen,
  IdFamilleOptimiserLog,
  IdVarianteOptimiserLog,
  ModeCalculOptimiserLog,
} from "../../core6e/optimiserModeleLog.types";

export type { IdFamilleOptimiserLog, IdVarianteOptimiserLog } from "../../core6e/optimiserModeleLog.types";

/**
 * Couche A (6e) — tirage de `6gen91` « Optimiser un modèle logarithmique ». Une fonction de
 * construction par situation ; tirage libre équiprobable parmi les 5 (`CATALOGUE_VARIANTES`, aussi
 * utilisé par `SelecteurVarianteDev` et l'adaptateur d'export). Uniquement `Math.random` : la graine
 * des feuilles imprimées (`export/codeExercice.ts::avecGraine`) rejoue la même instance.
 *
 * Paramètres tirés « à l'envers » : l'optimum d'abord (entier, demi-entier ou eᵏ), puis les
 * coefficients. Le mode de précision (`exacte` / `arrondie`) est tiré AVANT la boucle de rejet pour
 * ne pas biaiser sa fréquence (≈ 1/2 dans les trois situations à optimum eᵏ).
 */

/** Variantes = FAMILLES de fonctions (décision de l'utilisateur) ; la situation est tirée dans la
 * famille, AVANT la construction : dans « x ln x », coût moyen (minimum) et débit (maximum) sortent
 * une fois sur deux, donc la nature de l'optimum n'est pas figée d'une série à l'autre. */
export const CATALOGUE_VARIANTES: { id: IdFamilleOptimiserLog; label: string }[] = [
  { id: "ln-lineaire", label: "a ln(…) − bx : engrais (c + a ln(1 + x) − bx) ou bénéfice (a ln(q) − bq − c)" },
  { id: "x-ln-x", label: "x ln x : coût moyen (minimum) ou débit d'une route (maximum)" },
  { id: "ln-sur-x", label: "ln(x)/x : bénéfice moyen (a ln(x) + d)/x" },
];

export const SITUATIONS_PAR_FAMILLE: Record<IdFamilleOptimiserLog, IdVarianteOptimiserLog[]> = {
  "ln-lineaire": ["engrais", "benefice"],
  "x-ln-x": ["cout-moyen", "debit"],
  "ln-sur-x": ["rendement-moyen"],
};

export function familleDeSituation(situation: IdVarianteOptimiserLog): IdFamilleOptimiserLog {
  return (Object.keys(SITUATIONS_PAR_FAMILLE) as IdFamilleOptimiserLog[]).find((f) => SITUATIONS_PAR_FAMILLE[f].includes(situation))!;
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entier(min: number, max: number, pas = 1): number {
  const n = Math.floor((max - min) / pas) + 1;
  return min + pas * Math.floor(Math.random() * n);
}

function melanger(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function tirerMode(): ModeCalculOptimiserLog {
  return Math.random() < 0.5 ? "exacte" : "arrondie";
}

// ============================================================================
// Engrais : R(x) = c + a ln(1 + x) − bx, maximum en x* = a/b − 1.
// ============================================================================

export function construireEngrais(): ExerciceEngrais {
  for (;;) {
    const b = choisir([2, 3, 4, 5, 6]);
    const xs = choisir([1, 2, 3, 4, 0.5, 1.5, 2.5]);
    const a = b * (1 + xs);
    if (!Number.isInteger(a)) continue;
    const c = entier(20, 50, 5);
    const M = Math.ceil(xs) + entier(2, 4);
    const R = (x: number) => c + a * Math.log(1 + x) - b * x;
    const gain = R(xs) - c;
    if (gain < 2 || R(xs) > 110 || R(M) < 0.6 * c) continue;
    return { variante: "engrais", mode: "arrondie", culture: choisir(["blé", "maïs", "orge"] as const), a, b, c, M, ordreNature: melanger(4) };
  }
}

// ============================================================================
// Bénéfice : B(q) = a ln(q) − bq − c, maximum en q* = a/b (> e pour un bénéfice positif).
// ============================================================================

export function construireBenefice(): ExerciceBenefice {
  for (;;) {
    const qs = choisir([3, 3.5, 4, 4.5, 5, 6]);
    const b = entier(2, 8);
    const a = b * qs;
    if (!Number.isInteger(a)) continue;
    const marge = a * Math.log(qs) - a;
    if (marge < 4) continue;
    const c = entier(1, Math.floor(marge - 2));
    const B = marge - c;
    if (B < 2 || B > 40) continue;
    const M = Math.ceil(qs) + entier(2, 5);
    return { variante: "benefice", mode: "arrondie", produit: choisir(["vélos", "trottinettes", "imprimantes"] as const), a, b, c, M, ordreNature: melanger(4) };
  }
}

// ============================================================================
// Bénéfice moyen : f(x) = (a ln(x) + d)/x, d = a(1 − k), maximum en eᵏ, f* = a e^(−k).
// ============================================================================

export function construireRendementMoyen(): ExerciceRendementMoyen {
  const mode = tirerMode();
  for (;;) {
    const k = choisir([0.5, 1, 1.5, 2]);
    const a = entier(4, 24, 2);
    const d = a * (1 - k);
    const fs = a * Math.exp(-k);
    if (fs < 1 || fs > 15) continue;
    const M = Math.ceil(Math.exp(k)) + entier(2, 5);
    return { variante: "rendement-moyen", mode, a, d, k, M, ordreNature: melanger(4) };
  }
}

// ============================================================================
// Coût moyen : C(x) = a x ln(x) − bx + c, b = a(k + 1), minimum en eᵏ, C* = c − a eᵏ.
// ============================================================================

export function construireCoutMoyen(): ExerciceCoutMoyen {
  const mode = tirerMode();
  for (;;) {
    const k = choisir([-1, 0.5, 1, 1.5]);
    const a = k === 0.5 || k === 1.5 ? choisir([2, 4]) : entier(1, 5);
    const b = a * (k + 1);
    const c = Math.ceil(a * Math.exp(k)) + entier(2, 12);
    const Cs = c - a * Math.exp(k);
    if (Cs < 2 || Cs > 16) continue;
    const M = k < 0 ? entier(2, 3) : Math.ceil(Math.exp(k)) + entier(2, 4);
    return { variante: "cout-moyen", mode, a, b, c, k, M, ordreNature: melanger(4) };
  }
}

// ============================================================================
// Débit : D(v) = av − bv ln(v), a = b(k + 1), maximum en eᵏ, D* = b eᵏ ; D ≥ 0 tant que v ≤ e^(k+1).
// ============================================================================

const BORNES_DEBIT: Record<string, number[]> = { "1": [5, 6, 7], "1.5": [8, 9, 10, 12], "2": [9, 10, 12, 13] };

export function construireDebit(): ExerciceDebit {
  const mode = tirerMode();
  for (;;) {
    const k = choisir([1, 1.5, 2]);
    const b = k === 1.5 ? choisir([2, 4, 6, 8]) : entier(2, k === 2 ? 5 : 8);
    const a = b * (k + 1);
    const M = choisir(BORNES_DEBIT[String(k)]);
    if (M > Math.exp(k + 1)) continue;
    return { variante: "debit", mode, a, b, k, M, ordreNature: melanger(4) };
  }
}

// ============================================================================
// Points d'entrée.
// ============================================================================

/** Construit une instance d'une FAMILLE (variante du catalogue : situation tirée dans la famille)
 * ou d'une situation précise. */
export function construireAvecVarianteId(id: string): ExerciceOptimiserLog {
  if (id in SITUATIONS_PAR_FAMILLE) return construireSituation(choisir(SITUATIONS_PAR_FAMILLE[id as IdFamilleOptimiserLog]));
  return construireSituation(id as IdVarianteOptimiserLog);
}

function construireSituation(id: IdVarianteOptimiserLog): ExerciceOptimiserLog {
  switch (id) {
    case "engrais":
      return construireEngrais();
    case "benefice":
      return construireBenefice();
    case "rendement-moyen":
      return construireRendementMoyen();
    case "cout-moyen":
      return construireCoutMoyen();
    case "debit":
      return construireDebit();
  }
}

/** Tirage libre : famille équiprobable parmi les 3 du catalogue, puis situation dans la famille. */
export function genererExerciceOptimiserLog(): ExerciceOptimiserLog {
  return construireAvecVarianteId(choisir(CATALOGUE_VARIANTES).id);
}
