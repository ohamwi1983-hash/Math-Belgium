/** Couche A (6e) — petits helpers de tirage propres à `6gen21`. Dupliqués depuis
 * `generateurs6e/etudeFonctionExponentielle/aleatoire.ts` (même principe déjà établi ailleurs sur
 * la plateforme — un petit module utilitaire par générateur, plutôt qu'un partage forcé entre
 * générateurs indépendants). */

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Mélange les 4 candidats (Fisher-Yates) et retourne le nouvel index du candidat RÉEL (toujours
 * à l'index 0 avant mélange, par convention d'appel). */
export function melangerAvecIndexCorrect<T>(candidats: readonly T[]): { candidats: T[]; indexCorrect: number } {
  const melanges = [...candidats];
  let indexCorrect = 0;
  for (let i = melanges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melanges[i], melanges[j]] = [melanges[j], melanges[i]];
    if (indexCorrect === i) indexCorrect = j;
    else if (indexCorrect === j) indexCorrect = i;
  }
  return { candidats: melanges, indexCorrect };
}
