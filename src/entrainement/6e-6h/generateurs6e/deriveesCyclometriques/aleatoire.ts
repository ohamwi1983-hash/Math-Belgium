/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen4`. */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export const ARCFONCTIONS: readonly ("arcsin" | "arccos" | "arctan")[] = ["arcsin", "arccos", "arctan"];
export const ARCFONCTIONS_BORNEES: readonly ("arcsin" | "arccos")[] = ["arcsin", "arccos"];
