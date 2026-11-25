import { fact } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Couche core — `6gen121` « Poisson : λ inconnu, valeur la plus probable, seuil d'alerte » (6e ch. 8,
 * § 8, processus 3 TRANSFÉRER). Quatre variantes :
 * - `lambdaZero` : P(X = 0) donnée → λ = −ln P(X = 0), puis λ ajusté à une autre durée (ou un autre
 *   nombre de pages), puis une probabilité ;
 * - `egalite` : P(X = k + 1) = c · P(X = k) → λ = c(k + 1) (récurrence du cours), puis E(X) = λ et
 *   σ(X) = √λ, puis une probabilité ;
 * - `mode` : λ donné → valeur(s) la (les) plus probable(s) par la récurrence P(X = k) = P(X = k − 1)·λ/k
 *   (deux valeurs si λ est entier : verdict tiré au tiers, jamais dans `forme`), puis sa probabilité ;
 * - `seuil` : taux par période → λ ajusté, plus petit k tel que P(X ≥ k) ≤ α (seuil d'alerte), et
 *   P(X ≥ k).
 */

export type VariantePL = "lambdaZero" | "egalite" | "mode" | "seuil";
export type PhasePL = "lambda" | "lambdaAjuste" | "esperance" | "mode" | "seuil" | "proba";

export const VARIANTES_PL: VariantePL[] = ["lambdaZero", "egalite", "mode", "seuil"];

export interface ExercicePL {
  variante: VariantePL;
  ctx: number;
  /** Paramètres (voir le générateur) : `l10` = 10λ (λ de base), `m` facteur d'échelle, `k`, `c2` = 2c,
   * `q` (question : 0 = P(X = k), 1 = P(X ≤ 1)), `a100` = 100α. */
  d: Record<string, number>;
}

export function phases(e: ExercicePL): PhasePL[] {
  switch (e.variante) {
    case "lambdaZero":
      return ["lambda", "lambdaAjuste", "proba"];
    case "egalite":
      return ["lambda", "esperance", "proba"];
    case "mode":
      return ["mode", "proba"];
    case "seuil":
      return ["lambdaAjuste", "seuil", "proba"];
  }
}

export const terme = (l: number, k: number) => (Math.exp(-l) * l ** k) / fact(k);
export const cumul = (l: number, k: number) => {
  let s = 0;
  for (let i = 0; i <= k; i++) s += terme(l, i);
  return s;
};
export const auMoins = (l: number, k: number) => (k <= 0 ? 1 : 1 - cumul(l, k - 1));

/** λ de base (avant ajustement). */
export const lambdaBase = (e: ExercicePL): number => {
  if (e.variante === "egalite") return (e.d.c2! / 2) * (e.d.k! + 1);
  return e.d.l10! / 10;
};
/** P(X = 0) donnée (lambdaZero), quatre décimales. */
export const p0 = (e: ExercicePL) => Math.round(Math.exp(-lambdaBase(e)) * 1e4) / 1e4;
/** λ ajusté (lambdaZero, seuil). */
export const lambdaAjuste = (e: ExercicePL) => lambdaBase(e) * e.d.m!;
/** λ de la probabilité finale. */
export const lambdaFinal = (e: ExercicePL) => (e.variante === "lambdaZero" || e.variante === "seuil" ? lambdaAjuste(e) : lambdaBase(e));

/** Valeurs les plus probables (mode). */
export function modes(l: number): number[] {
  const f = Math.floor(l);
  return Math.abs(l - Math.round(l)) < 1e-9 ? [Math.round(l) - 1, Math.round(l)] : [f];
}

/** Seuil d'alerte : plus petit k tel que P(X ≥ k) ≤ α. */
export function seuil(l: number, alpha: number): number {
  let k = 0;
  while (auMoins(l, k) > alpha) k++;
  return k;
}

/** Probabilité finale demandée. */
export function probaFinale(e: ExercicePL): number {
  const l = lambdaFinal(e);
  if (e.variante === "mode") return terme(l, modes(l)[0]!);
  if (e.variante === "seuil") return auMoins(l, seuil(l, e.d.a100! / 100));
  return e.d.q === 1 ? terme(l, 0) + terme(l, 1) : terme(l, e.d.j!);
}

/** Probabilités acceptées : avec λ exact, et (lambdaZero) avec λ = −ln P(X = 0) donnée. */
export function refsProba(e: ExercicePL): number[] {
  const res = [probaFinale(e)];
  if (e.variante === "lambdaZero") {
    const l = -Math.log(p0(e)) * e.d.m!;
    res.push(e.d.q === 1 ? terme(l, 0) + terme(l, 1) : terme(l, e.d.j!));
  }
  return res;
}
