/** Tirages uniformes — utilitaires locaux à 5gen17 (même principe que les autres générateurs 5e,
 * chacun le sien plutôt qu'un module partagé entre générateurs). */
export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisirParmi<T>(tableau: readonly T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}
