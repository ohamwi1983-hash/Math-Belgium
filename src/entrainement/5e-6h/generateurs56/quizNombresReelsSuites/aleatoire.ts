// Copie 5e (6h) de `5e-4h/generateurs5e/quizSuites5e/aleatoire.ts` (56gen13 ← 5gen41, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
