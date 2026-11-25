import type { ExerciceBinomeA, ExerciceBinomeB, ExerciceBinomeC, ExerciceBinomeD, ExerciceBinomeNewton, SousTypeBinomeB, TermeBinome } from "../../core6e/binomeNewton.types";
import { coefficientBinomial } from "../combinatoire";
import { melanger, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — `6gen45` « Binôme de Newton » (6e ch. 7, § 3).
 * Catalogue : ordre figé (codes imprimés) ; « D — triangle de Pascal » AJOUTÉE EN FIN de liste.
 * La variante C (même identifiant) est devenue une vraie approximation (audit, G12).
 * Tirage libre : chaque variante à parts égales.
 */

const VALEURS_A = [-3, -2, -1, 2, 3] as const;
const VALEURS_B = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] as const;

function construireTermes(a: number, b: number, n: number): TermeBinome[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const c = coefficientBinomial(n, k);
    return { k, coefficientBinomial: c, exposantX: n - k, coefficientFinal: c * a ** (n - k) * b ** k };
  });
}

export function construireFamilleA(a: number = tirerParmi(VALEURS_A), b: number = tirerParmi(VALEURS_B), n: number = tirerParmi([3, 4, 5] as const)): ExerciceBinomeA {
  return { famille: "A", a, b, n, termes: construireTermes(a, b, n) };
}

function construireB(sousType: SousTypeBinomeB): ExerciceBinomeB {
  const a = tirerParmi(VALEURS_A);
  const b = tirerParmi(VALEURS_B);
  const n = tirerEntier(4, 7);
  const k = tirerEntier(1, n - 1);
  const c = coefficientBinomial(n, k);
  return { famille: "B", sousType, a, b, n, rang: k + 1, p: n - k, k, coefficientBinomial: c, aPuissance: a ** (n - k), bPuissance: b ** k, coefficientFinal: c * a ** (n - k) * b ** k };
}

export function construireRang(): ExerciceBinomeB {
  return construireB("rang");
}

export function construirePuissance(): ExerciceBinomeB {
  return construireB("puissance");
}

/** (1 + ε)ⁿ avec nε petit (|nε| ≤ 0,3) : ε = ±1, ±2, ±3 ou 5 centièmes. */
export function construireFamilleC(): ExerciceBinomeC {
  for (;;) {
    const epsilonCentiemes = tirerParmi([-3, -2, -1, 1, 2, 3, 5] as const);
    const n = tirerEntier(3, 10);
    if (Math.abs(n * epsilonCentiemes) <= 30) return { famille: "C", epsilonCentiemes, n };
  }
}

export function construireFamilleD(): ExerciceBinomeD {
  const n = tirerEntier(5, 9);
  const ligne = Array.from({ length: n + 1 }, (_, k) => coefficientBinomial(n, k));
  // Trois positions de la ligne n + 1, dont au moins une dans la seconde moitié (la symétrie ne suffit pas à tout trouver).
  const positions = melanger(Array.from({ length: n }, (_, i) => i + 1))
    .slice(0, 3)
    .sort((x, y) => x - y);
  return { famille: "D", n, ligne, positions };
}

export type IdVarianteBinomeNewton = "A" | "B_rang" | "B_puissance" | "C" | "D_pascal";

export const CATALOGUE_VARIANTES: { id: IdVarianteBinomeNewton; label: string }[] = [
  { id: "A", label: "A — Développement complet de (ax + b)ⁿ" },
  { id: "B_rang", label: "B — Terme de rang r donné" },
  { id: "B_puissance", label: "B — Coefficient du terme en xᵖ" },
  { id: "C", label: "C — Approximation (1 + ε)ⁿ ≈ 1 + nε" },
  { id: "D_pascal", label: "D — Triangle de Pascal" },
];

const CONSTRUCTEURS: Record<IdVarianteBinomeNewton, () => ExerciceBinomeNewton> = {
  A: () => construireFamilleA(),
  B_rang: construireRang,
  B_puissance: construirePuissance,
  C: construireFamilleC,
  D_pascal: construireFamilleD,
};

export function construireAvecVarianteId(id: IdVarianteBinomeNewton): ExerciceBinomeNewton {
  return CONSTRUCTEURS[id]();
}

export function genererExerciceBinomeNewton(): ExerciceBinomeNewton {
  return CONSTRUCTEURS[tirerParmi(CATALOGUE_VARIANTES).id]();
}

export type { ExerciceBinomeA, ExerciceBinomeB, ExerciceBinomeC, ExerciceBinomeD };
