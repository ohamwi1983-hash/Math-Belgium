export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Mélange Fisher-Yates — jamais une simple permutation partielle, même principe que
 * `ordreTermes`/l'exercice "Analyse d'une fonction du second degré" ou `trierAleatoirement` du
 * générateur "Norme d'un vecteur et distance entre 2 points". */
export function trierAleatoirement<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
