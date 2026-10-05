export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Fisher-Yates, même patron que `combinaisonVecteurs`/`lieuxGeometriques` (dupliqué, pas partagé —
 * trop petit pour l'extraction, convention déjà établie sur la plateforme). */
export function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j] as T, copie[i] as T];
  }
  return copie;
}
