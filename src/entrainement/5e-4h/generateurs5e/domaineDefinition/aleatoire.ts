/** Petits utilitaires aléatoires partagés par les 6 familles de 5gen1 — mêmes primitives que
 * celles dupliquées ailleurs sur la plateforme (ex. gen55/57/58), pas d'import cross-chantier. */

export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function entierNonNulAleatoire(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}

export function choisirParmi<T>(tableau: readonly T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

/** Deux entiers distincts dans [min,max] (plage suffisamment large pour toujours en trouver 2). */
export function deuxEntiersDistincts(min: number, max: number): [number, number] {
  const a = entierAleatoire(min, max);
  let b = entierAleatoire(min, max);
  while (b === a) b = entierAleatoire(min, max);
  return [a, b];
}

export function signeAleatoire(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}
