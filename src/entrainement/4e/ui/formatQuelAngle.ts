/**
 * Présentation — "Quel angle ?" (chapitre 3, générateur en position 18). Réutilise les tables
 * LaTeX exactes de "Valeurs remarquables" (générateur 15, `generateurs/valeursRemarquables/tables.ts`
 * — import générateur→présentation, autorisé, `src/ui/` peut dépendre de n'importe quelle
 * verticale) plutôt que de les redéfinir : la valeur `k` de l'énoncé et l'angle de référence des
 * aides utilisent exactement les mêmes valeurs remarquables que ce générateur.
 */
import type { ExerciceQuelAngle, FonctionTrig } from "../core/quelAngle.types";
import { LATEX_COS, LATEX_SIN, LATEX_TAN } from "../generateurs/valeursRemarquables/tables";
import { libelleQuadrants } from "./quelAngleAide";

const NOM_FONCTION_LATEX: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

const TABLE_LATEX_MAGNITUDE: Record<FonctionTrig, Record<number, string>> = {
  sin: LATEX_SIN,
  cos: LATEX_COS,
  tan: LATEX_TAN,
};

export const DOMAINE_LATEX = "\\left[0^\\circ,\\ 360^\\circ\\right[";

/** Bloc énoncé fixe — `sin α = k` (valeur exacte, signée) — jamais recalculé depuis `Math.sin`/
 * `cos`/`tan`, toujours composé depuis les tables exactes de "Valeurs remarquables". */
export function formatEnonceLatex(exercice: ExerciceQuelAngle): string {
  const magnitude = TABLE_LATEX_MAGNITUDE[exercice.fonction][exercice.angleReference];
  const valeur = exercice.signeK === 1 ? magnitude : `-${magnitude}`;
  return `${NOM_FONCTION_LATEX[exercice.fonction]}\\alpha = ${valeur}`;
}

/**
 * Texte de l'aide unique — révèle les quadrants concernés (`promptcorrectionsgenerateur18aideunique.md`,
 * remplace l'ancien système à 3 aides progressives : plus aucune mention d'angle de référence ni de
 * formule de construction, retirées avec les deux autres anciens niveaux). Pour la variante tangente
 * uniquement, mentionne la période de 180° (spec d'origine, toujours valable : "s'assurer que le
 * texte... mentionne bien qu'il y aura toujours exactement 2 solutions... sans donner ce nombre trop
 * explicitement") — la période explique PAR CONSTRUCTION pourquoi chaque quadrant surligné ne
 * contient jamais qu'une seule solution, jamais un compte explicite "il y a 2 solutions" affiché tel
 * quel, cohérent avec la règle "pas d'aide séparée pour le nombre de solutions" (déductible du
 * nombre de quadrants surlignés).
 */
export function texteAideQuadrants(exercice: ExerciceQuelAngle): string {
  const base = `Les solutions se trouvent dans ${libelleQuadrants(exercice.solutions)}.`;
  if (exercice.fonction !== "tan") return base;
  return `${base} La tangente a une période de 180° : chaque quadrant concerné contient exactement une solution.`;
}

/** Révélation finale — `α = 60°` ou `α = 60°` ou `α = 240°` (jointure "ou", toujours au moins une
 * solution par construction). */
export function formatSolutionsLatex(exercice: ExerciceQuelAngle): string {
  return exercice.solutions.map((s) => `\\alpha = ${s}^\\circ`).join("\\text{ ou }");
}

/** Version "bloc fitter" de `formatSolutionsLatex` (`promptblocfittertousgenerateurs.md`) — un
 * fragment KaTeX par solution (toujours 2, "ou" en préfixe du second) plutôt qu'une seule chaîne
 * `\text{ ou }`-jointe. */
export function formatTermesSolutionsLatex(exercice: ExerciceQuelAngle): string[] {
  return exercice.solutions.map((s, i) => (i === 0 ? `\\alpha = ${s}^\\circ` : `\\text{ ou } \\alpha = ${s}^\\circ`));
}
