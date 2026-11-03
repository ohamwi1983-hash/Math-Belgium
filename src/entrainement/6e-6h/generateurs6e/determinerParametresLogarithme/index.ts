import type { ExerciceDeterminerParametresLogarithme, VarianteParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";

/**
 * Couche A (6e) — générateur `6gen18` (f(x) = a + b·ln(x), paramètres lus sur un graphique). Voir
 * `core6e/determinerParametresLogarithme.types.ts` pour la décomposition et les variantes.
 *
 * Plages : a ∈ {−2, …, 3}, b ∈ {−3, −2, −1, 1, 2, 3} — entiers pour une lecture exacte sur un
 * quadrillage d'unité 1 ; pour `pointE2`, |a + 2b| ≤ 9 reste dans un cadre lisible. Les trois
 * variantes sont équiprobables.
 */

const VALEURS_A = [-2, -1, 0, 1, 2, 3] as const;
const VALEURS_B = [-3, -2, -1, 1, 2, 3] as const;
const VARIANTES: VarianteParametresLogarithme[] = ["pente", "pointE", "pointE2"];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function construireVariante(variante: VarianteParametresLogarithme): ExerciceDeterminerParametresLogarithme {
  const a = tirerParmi(VALEURS_A);
  const b = tirerParmi(VALEURS_B);
  const pFirst = Math.random() < 0.5;
  return { variante, a, b, lettrePoint1: pFirst ? "P" : "Q", lettrePoint2: pFirst ? "Q" : "P" };
}

export function genererExerciceDeterminerParametresLogarithme(): ExerciceDeterminerParametresLogarithme {
  return construireVariante(tirerParmi(VARIANTES));
}

/** Catalogue dev (`SelecteurVarianteDev`) — libellés neutres, jamais la réponse. */
export const CATALOGUE_VARIANTES: { id: VarianteParametresLogarithme; label: string }[] = [
  { id: "pente", label: "Point en x = 1 et tangente en x = 1" },
  { id: "pointE", label: "Point en x = 1 et point en x = e" },
  { id: "pointE2", label: "Point en x = 1 et point en x = e²" },
];

export function construireAvecVarianteId(id: VarianteParametresLogarithme): ExerciceDeterminerParametresLogarithme {
  return construireVariante(id);
}
