import type { ValeurVariation } from "../core/analyseFonction.types";

const ORDRE_CYCLE: ValeurVariation[] = ["⌢", "⌣", "↗", "↘"];

/**
 * Cycle de la ligne "variation" du tableau signe et variation (étape 6) — un seul cycle uniforme
 * à 4 états sur **toutes** les colonnes, x_S comprise (point 4, prompt-4-modifications-analyse-
 * fonction.md) : aucune restriction structurelle par colonne, c'est à l'élève de déterminer
 * lui-même que seule la colonne x_S doit recevoir un symbole de sommet. Ne revient **jamais** à
 * "?" une fois une valeur choisie — même convention que cyclerValeurCellule (ligne "signe") depuis
 * ce correctif, contrairement au comportement précédent qui rebouclait sur "?".
 */
export function cyclerValeurVariation(actuel: ValeurVariation | null): ValeurVariation {
  if (actuel === null) return ORDRE_CYCLE[0];
  const index = ORDRE_CYCLE.indexOf(actuel);
  return ORDRE_CYCLE[(index + 1) % ORDRE_CYCLE.length];
}

/** "Valider" reste désactivé tant qu'au moins une cellule de la ligne "variation" est à "?" (null). */
export function ligneVariationEstComplete(ligne: (ValeurVariation | null)[]): boolean {
  return ligne.every((v) => v !== null);
}

/** Même principe que celluleEstErronee (cycleValeurCellule.ts) : rouge seulement si remplie et fausse. */
export function celluleVariationErronee(saisie: ValeurVariation | null, attendu: ValeurVariation): boolean {
  return saisie !== null && saisie !== attendu;
}
