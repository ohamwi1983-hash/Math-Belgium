/** Couche A (5e) — petits helpers partagés entre les 4 familles de 5gen23. */

export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}

/** Mélange une copie du tableau (Fisher-Yates), jamais l'original — utilisé pour l'ordre fixe (mais
 * mélangé à la génération) des options d'un écran QCM. */
export function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Tire un élément uniformément au hasard — utilisé pour le contexte narratif (30 par famille). */
export function tirerElement<T>(tableau: T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

/** Majuscule la première lettre (préserve une apostrophe initiale, ex. "l'effectif" → "L'effectif"). */
export function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
