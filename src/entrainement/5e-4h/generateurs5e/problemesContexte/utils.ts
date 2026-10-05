export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerElement<T>(tableau: T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}
