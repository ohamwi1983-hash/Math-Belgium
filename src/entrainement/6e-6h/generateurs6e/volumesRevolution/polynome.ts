import type { TermeA } from "../../core6e/calculPrimitives.types";
import { polynomeVersTermes } from "../calculAires/polynome";

/**
 * Couche A (6e) — utilitaire polynomial ADDITIONNEL pour `6gen27` : `multiplierPolynomes` (produit
 * GÉNÉRAL de 2 polynômes, nécessaire pour élever un polynôme au carré — jamais requis par 6gen26,
 * qui ne fait que des sommes/un produit par facteur LINÉAIRE) et `termesVersPolynome` (inverse de
 * `polynomeVersTermes`, 6gen26, réutilisée telle quelle pour le sens retour). AJOUTÉ ici plutôt que
 * dans `generateurs6e/calculAires/polynome.ts` (fichier d'un autre générateur, non modifié par
 * celui-ci) — voir en-tête `core6e/volumesRevolution.types.ts`.
 *
 * Même convention de représentation que `calculAires/polynome.ts` : `number[]` de coefficients par
 * puissance CROISSANTE (`poly[i]` = coefficient de x^i).
 */

/** Inverse de `polynomeVersTermes` — reconstruit le tableau de coefficients croissants depuis une
 * somme de `TermeA` "puissance"/"constante" (jamais expX/cosX/etc., réservés à la famille A
 * "exponentielle"/"trigonometrique", qui n'utilise jamais cette fonction). */
export function termesVersPolynome(termes: TermeA[]): number[] {
  let degre = 0;
  for (const t of termes) if (t.type === "puissance") degre = Math.max(degre, t.n as number);
  const poly = new Array(degre + 1).fill(0);
  for (const t of termes) {
    if (t.type === "constante") poly[0] += t.coef;
    else if (t.type === "puissance") poly[t.n as number] += t.coef;
  }
  return poly;
}

/** Produit de 2 polynômes (convolution des coefficients croissants). */
export function multiplierPolynomes(a: number[], b: number[]): number[] {
  const resultat = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      resultat[i + j] += a[i] * b[j];
    }
  }
  return resultat;
}

/** f(x)², développée — carré d'une somme de `TermeA` puissance/constante. */
export function carreTermes(termes: TermeA[]): TermeA[] {
  const poly = termesVersPolynome(termes);
  const carre = multiplierPolynomes(poly, poly);
  return polynomeVersTermes(carre);
}
