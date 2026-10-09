/** Couche A (6e) — petits helpers de tirage partagés par les 7 familles de `6gen22`. Dupliqués
 * plutôt qu'importés d'un autre générateur — convention déjà établie sur ce chantier (voir
 * `generateurs6e/exponentiellesProblemes/aleatoire.ts`). */

export function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Arrondi à `decimales` décimales (0 par défaut) — utilisé pour toutes les valeurs `*Affiche`
 * (seules valeurs numériques montrées à l'élève quand elles proviennent d'un calcul interne,
 * jamais la valeur exacte utilisée pour la correction). */
export function arrondir(valeur: number, decimales = 0): number {
  const f = Math.pow(10, decimales);
  return Math.round(valeur * f) / f;
}

/** Tire deux entiers DISTINCTS triés croissant dans `[min,max]` — utilisé par la famille A
 * "fenêtre" (2 temps-cibles distincts) et la famille E (2 points distincts). */
export function tirerDeuxEntiersDistinctsTries(min: number, max: number): [number, number] {
  const a = tirerEntier(min, max);
  let b = tirerEntier(min, max);
  while (b === a) b = tirerEntier(min, max);
  return a < b ? [a, b] : [b, a];
}
