import type { Morceau } from "../core/inequation.types";
import { formatValeurExacteLatex } from "./formatCaracteristiquesAlgebriques";

/**
 * Widget simplifié de l'étape "condition de validité de l'équation" (niveau 2, `racine_carree`/
 * `valeur_absolue` — `prompt-corrections-niveau2-vague3.md`, point 1). Cette condition est
 * TOUJOURS structurellement de la forme `x ≥ v` ou `x ≤ v` (jamais une union d'intervalles, jamais
 * `ℝ` ni `∅`, le coefficient directeur de l'expression concernée n'étant jamais nul par
 * construction — voir `core/caracteristiquesAlgebriques.types.ts`, doc de `FormeCondition`) : le
 * composant de construction d'intervalle complet (`ℝ`/Intervalle/`∅`, réutilisé ailleurs pour les
 * conditions d'existence du domaine de `f`, voir `EtapeDomaineNiveau1.tsx` — **jamais touché** par
 * cette simplification) est donc surdimensionné ici. Remplacé par un sélecteur à deux options
 * (`≥`/`≤`) + un champ libre pour la valeur seuil, produisant directement le `Morceau` demi-droite
 * fermée attendu — `ReponseCondition`/`verifierConditionValidite` restent totalement inchangés,
 * seule la MÉCANIQUE DE SAISIE change.
 */
export type SymboleConditionSimple = "≥" | "≤";

/** `Morceau` demi-droite fermée correspondant au symbole/à la valeur choisis — `null` tant que
 * l'un des deux manque. Même convention `[`/`]` que le reste du projet (notation francophone à
 * crochets inversés) : `x ≥ v` ⟹ `[v;+∞[`, `x ≤ v` ⟹ `]-∞;v]`. */
export function construireConditionValiditeSimple(symbole: SymboleConditionSimple | null, valeur: number | null): Morceau | null {
  if (symbole === null || valeur === null) return null;
  return symbole === "≥"
    ? { crochetGauche: "[", borneGauche: valeur, crochetDroit: "[", borneDroite: "+inf" }
    : { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "]", borneDroite: valeur };
}

/** Aperçu LaTeX en temps réel (`x ≥ [valeur]`/`x ≤ [valeur]`), mis à jour à chaque interaction —
 * même principe que `formatApercuDomaine`/`formatApercuSolution` du reste du projet : `?` tant que
 * le symbole n'est pas choisi, tiret LaTeX (`\_`) tant que la valeur n'est pas saisie (ou invalide),
 * jamais une saisie figée. `valeur` est la valeur déjà PARSÉE (tolérante aux fractions,
 * `parserNombreOuFraction`), rendue en fraction exacte via `formatValeurExacteLatex` — jamais un
 * décimal bruité. */
export function formatApercuConditionValiditeSimple(symbole: SymboleConditionSimple | null, valeur: number | null): string {
  const symboleLatex = symbole === "≥" ? "\\geq" : symbole === "≤" ? "\\leq" : "?";
  const valeurLatex = valeur === null ? "\\_" : formatValeurExacteLatex(valeur);
  return `x ${symboleLatex} ${valeurLatex}`;
}
