import type { ValeurCellule } from "../core/signesProduit.types";

/**
 * Cycle à 3 états d'une cellule du tableau de signes (prompt-refonte-tableau-signes.md, section
 * 3) : ? (null) → + → - → 0 → + → ... en boucle. Aucune cellule n'est pré-remplie (même un "0"
 * structurellement prévisible) — l'élève doit cliquer jusqu'à la bonne valeur lui-même.
 */
export function cyclerValeurCellule(actuel: ValeurCellule | null): ValeurCellule {
  if (actuel === null) return "+";
  if (actuel === "+") return "-";
  if (actuel === "-") return "0";
  return "+";
}

/** "Valider" reste désactivé tant qu'au moins une cellule (ligne ou produit) est encore à "?" (null). */
export function grilleEstComplete(lignes: (ValeurCellule | null)[][], produit: (ValeurCellule | null)[]): boolean {
  return lignes.every((ligne) => ligne.every((v) => v !== null)) && produit.every((v) => v !== null);
}

/**
 * Retour visuel après une tentative échouée (section 4) : une cellule remplie mais différente de
 * la valeur attendue est erronée (rouge) ; une cellule encore à "?" n'est jamais marquée erronée
 * (rien à comparer), une cellule correcte non plus (reste en noir, pas de mise en valeur positive).
 * Comparaison toujours "en direct" contre la grille attendue (exercice.grille, déjà connue côté
 * client — application statique sans backend) plutôt qu'un instantané figé au moment de la
 * soumission : si l'élève corrige une cellule, le rouge disparaît immédiatement pour celle-ci.
 */
export function celluleEstErronee(saisie: ValeurCellule | null, attendu: ValeurCellule): boolean {
  return saisie !== null && saisie !== attendu;
}
