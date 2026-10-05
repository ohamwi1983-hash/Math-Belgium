/** Petits utilitaires aléatoires partagés par les constructeurs niveau 1 et niveau 2 de ce
 * générateur — même principe que `secondDegre/aleatoire.ts`/`simplification/aleatoire.ts`. */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Entier non nul dans `[min,max]` (min/max de signes opposés) — redessine tant que 0 est tiré. */
export function randomIntNonNul(min: number, max: number): number {
  let n = randomInt(min, max);
  while (n === 0) n = randomInt(min, max);
  return n;
}

/** PGCD positif — dupliquée comme ailleurs dans le projet (`ajusterAuRatio`/`coteFactorise`),
 * évite de faire dépendre `src/generateurs/` de `src/moteur/` pour un si petit utilitaire. */
export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
