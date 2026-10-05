/** Position d'une colonne surlignée (aide) au sein de son "run" — bloc maximal de colonnes
 * CONSÉCUTIVES surlignées (un même bloc-solution). `"seul"` : colonne isolée (aucune voisine
 * surlignée) ; `"debut"`/`"fin"` : extrémité gauche/droite d'un run de 2+ colonnes ; `"milieu"` :
 * colonne intérieure d'un run de 3+ colonnes. */
export type PositionRunAide = "debut" | "milieu" | "fin" | "seul";

/**
 * Calcule, pour chaque colonne d'un tableau de signes/quotient, sa position dans le run de
 * colonnes surlignées auquel elle appartient — `null` si la colonne n'est pas surlignée. Sert à
 * fusionner l'affichage de l'aide en UN rectangle continu par bloc-solution (bordure gauche
 * seulement en `debut`/`seul`, droite seulement en `fin`/`seul`, haut+bas toujours) plutôt qu'un
 * encadré isolé par cellule (voir docs/conventions-transversales.md, "aide de lecture — tableau de
 * signes"). Une colonne exclue de la solution (ex. "∄", ou toute colonne pour laquelle la fonction
 * `colonneSatisfait*` du générateur a renvoyé `false`) casse le run comme n'importe quelle colonne
 * à `false` : elle ne reçoit aucune classe et sépare les deux blocs voisins.
 *
 * Petite fonction pure, réutilisée telle quelle par tous les tableaux de signes/quotient à aide (4e
 * ET 5e — la logique de calcul est strictement identique partout, un booléen par colonne, jamais
 * par ligne) ; seul le câblage JSX/CSS dans chaque composant `*Recap.tsx` reste dupliqué (voir leurs
 * commentaires "réimplémenté ici, jamais importé cross-chantier" — seule cette fonction de calcul de
 * tableau de booléens est partagée, jamais un composant React entier).
 */
export function calculerPositionsRunAide(colonnes: boolean[]): (PositionRunAide | null)[] {
  return colonnes.map((surlignee, j) => {
    if (!surlignee) return null;
    const precedente = j > 0 && colonnes[j - 1];
    const suivante = j < colonnes.length - 1 && colonnes[j + 1];
    if (precedente && suivante) return "milieu";
    if (precedente) return "fin";
    if (suivante) return "debut";
    return "seul";
  });
}
