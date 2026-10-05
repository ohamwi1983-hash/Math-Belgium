/**
 * Ligne d'en-tête "x" pour les colonnes du tableau signe et variation (étape 6) — mêmes 2k+1
 * colonnes que le corps (alternance zone/point), chaque valeur distinguée (racine(s) et x_S,
 * fusionnées/triées par grilleSigneVariation.colonnesValeurs) occupant sa colonne point ; les
 * colonnes zone restent vides (même convention que formatEnTeteInterieur, exercice 5).
 */
export function formatEnTeteSigneVariation(colonnesValeurs: number[]): string[] {
  const k = colonnesValeurs.length;
  const entete: string[] = Array.from({ length: 2 * k + 1 }, () => "");
  colonnesValeurs.forEach((valeur, j) => {
    entete[2 * j + 1] = String(valeur);
  });
  return entete;
}
