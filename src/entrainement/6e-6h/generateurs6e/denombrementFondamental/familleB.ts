import type { ExerciceDenombrementB } from "../../core6e/denombrementFondamental.types";
import { tirerEntier } from "./aleatoire";

/** Famille B de `6gen43` — diagonales d'un polygone convexe, D(n) = n(n − 3)/2 (direct ou inverse). */

export function calculerDiagonales(n: number): number {
  return (n * (n - 3)) / 2;
}

export function construireDirect(n: number = tirerEntier(5, 20)): ExerciceDenombrementB {
  const diagonales = calculerDiagonales(n);
  return { famille: "B", sousType: "direct", n, diagonales, constanteEquation: 2 * diagonales };
}

export function construireInverse(n: number = tirerEntier(6, 24)): ExerciceDenombrementB {
  const diagonales = calculerDiagonales(n);
  return { famille: "B", sousType: "inverse", n, diagonales, constanteEquation: 2 * diagonales };
}
