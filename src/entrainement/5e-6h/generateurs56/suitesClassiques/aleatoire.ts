// Copie 5e (6h) de `5e-4h/generateurs5e/suitesClassiques/aleatoire.ts` (56gen8 ← 5gen17, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
/** Tirages uniformes — utilitaires locaux à 5gen17 (même principe que les autres générateurs 5e,
 * chacun le sien plutôt qu'un module partagé entre générateurs). */
export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisirParmi<T>(tableau: readonly T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}
