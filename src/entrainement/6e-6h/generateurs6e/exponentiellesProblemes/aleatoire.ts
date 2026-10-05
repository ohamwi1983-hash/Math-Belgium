/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen12`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/equationsExponentielles/aleatoire.ts`, `generateurs6e/limitesExponentielles/aleatoire.ts`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Arrondi à `decimales` décimales (0 par défaut) — utilisé pour toutes les valeurs `*Affiche`
 * (seules valeurs numériques montrées à l'élève dans un énoncé, jamais la valeur exacte interne). */
export function arrondir(valeur: number, decimales = 0): number {
  const f = Math.pow(10, decimales);
  return Math.round(valeur * f) / f;
}
