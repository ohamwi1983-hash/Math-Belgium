/** Couche A (6e) — petits helpers de tirage partagés par les 4 familles de `6gen8`. Dupliqués
 * depuis `generateurs6e/graphiquesCyclometriques/aleatoire.ts` (même principe déjà établi ailleurs
 * sur la plateforme — un petit module utilitaire par générateur, plutôt qu'un partage forcé entre
 * générateurs indépendants). */

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Tire une valeur différente de `actuelle` parmi `ensemble` (reroll borné, ensemble supposé de
 * taille ≥2 pour toujours pouvoir en trouver une différente). */
export function tirerAutre<T>(actuelle: T, ensemble: readonly T[]): T {
  for (let i = 0; i < 100; i++) {
    const v = tirerParmi(ensemble);
    if (v !== actuelle) return v;
  }
  return ensemble.find((v) => v !== actuelle) ?? actuelle;
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
