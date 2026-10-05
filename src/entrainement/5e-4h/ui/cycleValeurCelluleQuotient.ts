import type { ValeurCelluleQuotient } from "../core/inequationRationnelle.types";

/**
 * Cycle à 4 états de la ligne "quotient" (grille de l'exercice "inéquations rationnelles",
 * section 3 de la spec) : ? (null) → + → - → 0 → ∄ → + → ... en boucle — un état de plus que le
 * cycle à 3 états des lignes N/D (cyclerValeurCellule, cycleValeurCellule.ts, réutilisé tel quel
 * pour ces deux lignes-là, mêmes 3 états). Aucune cellule n'est pré-remplie.
 */
export function cyclerValeurCelluleQuotient(actuel: ValeurCelluleQuotient | null): ValeurCelluleQuotient {
  if (actuel === null) return "+";
  if (actuel === "+") return "-";
  if (actuel === "-") return "0";
  if (actuel === "0") return "∄";
  return "+";
}

/** "Valider" reste désactivé tant qu'au moins une cellule des 3 lignes est encore à "?" (null). */
export function grilleQuotientEstComplete(
  ligneNumerateur: (ValeurCelluleQuotient | null)[],
  ligneDenominateur: (ValeurCelluleQuotient | null)[],
  ligneQuotient: (ValeurCelluleQuotient | null)[],
): boolean {
  return (
    ligneNumerateur.every((v) => v !== null) &&
    ligneDenominateur.every((v) => v !== null) &&
    ligneQuotient.every((v) => v !== null)
  );
}

/** Même principe que celluleEstErronee (cycleValeurCellule.ts) : comparaison en direct, jamais une cellule à "?" marquée erronée. */
export function celluleQuotientEstErronee(saisie: ValeurCelluleQuotient | null, attendu: ValeurCelluleQuotient): boolean {
  return saisie !== null && saisie !== attendu;
}
