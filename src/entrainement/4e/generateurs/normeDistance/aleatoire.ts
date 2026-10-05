export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Triplets pythagoriciens `(jambe1, jambe2, hypoténuse)` — `jambe1²+jambe2²=hypoténuse²` — pierre
 * angulaire des variantes "vecteur"/"distance"/"parametre" de ce générateur : n'importe quel
 * vecteur dont les composantes sont (dans un ordre quelconque, avec un signe quelconque) l'une de
 * ces deux jambes a une norme TOUJOURS entière exacte, jamais une racine irrationnelle. **Jamais
 * utilisée pour la variante "pythagore"**, qui travaille directement sur les longueurs AU CARRÉ —
 * toujours entières pour n'importe quel vecteur à composantes entières, aucun triplet n'y est
 * nécessaire.
 */
export const TRIPLETS_PYTHAGORICIENS: readonly [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
];

/**
 * Tire un vecteur `(x,y)` à composantes entières signées, norme exacte garantie — un triplet tiré
 * au hasard, jambes éventuellement échangées, chaque composante signée indépendamment (jamais un
 * tirage-puis-vérification, la propriété est garantie par construction).
 */
export function vecteurNormeExacte(): { x: number; y: number; norme: number } {
  const [p, q, h] = TRIPLETS_PYTHAGORICIENS[randomInt(0, TRIPLETS_PYTHAGORICIENS.length - 1)];
  const [a, b] = Math.random() < 0.5 ? [p, q] : [q, p];
  const x = Math.random() < 0.5 ? a : -a;
  const y = Math.random() < 0.5 ? b : -b;
  return { x, y, norme: h };
}
