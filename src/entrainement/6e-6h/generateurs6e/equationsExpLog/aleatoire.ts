/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen14`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/equationsExponentielles/aleatoire.ts`, 6gen9). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Tire 2 éléments DISTINCTS (sans remise) dans `candidats`. */
export function tirerDeuxDistincts<T>(candidats: readonly T[]): [T, T] {
  const a = tirerParmi(candidats);
  let b = tirerParmi(candidats);
  while (b === a) b = tirerParmi(candidats);
  return [a, b];
}

/** Vrai ssi `valeur` égale `base^k` pour un entier `k` dans `[-2,4]` (tolérance flottante) — pour
 * `base=e` (irrationnel), seul `k=0` (valeur=1) peut jamais correspondre puisque `valeur` est
 * toujours tirée entière ailleurs sur ce fichier (`e^k` pour k≠0 n'est jamais un entier) : ce test
 * détecte donc NATURELLEMENT, sans cas particulier, qu'une base d'Euler n'offre quasiment jamais de
 * "raccourci sans logarithme" — reflet fidèle de la réalité mathématique plutôt qu'une règle codée
 * en dur pour ce cas.
 */
export function estPuissanceEntiereDe(valeur: number, base: number): boolean {
  for (let k = -2; k <= 4; k++) {
    if (Math.abs(Math.pow(base, k) - valeur) < 1e-9) return true;
  }
  return false;
}
