/**
 * Couche A (6e) — tirage décimal borné, propre à `6gen51` (les autres générateurs 6e tirent
 * essentiellement des ENTIERS via `generateurs6e/calculPrimitives/aleatoire.ts` — ce générateur est
 * le premier du chantier à tirer systématiquement des décimaux à 2 chiffres, précision alignée sur
 * celle d'une table statistique papier). Couche A ↔ Couche A libre (CLAUDE.md) — pas de raison de
 * dupliquer `tirerEntier`/`tirerParmi`, réutilisés tels quels par les 5 familles.
 */

/** Décimal uniforme dans `[min;max]`, arrondi à `decimales` chiffres après la virgule. */
export function tirerDecimal(min: number, max: number, decimales: number): number {
  const brut = min + Math.random() * (max - min);
  const facteur = 10 ** decimales;
  return Math.round(brut * facteur) / facteur;
}

export function arrondi(valeur: number, decimales: number): number {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}
