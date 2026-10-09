import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import { evaluerCandidat, type ViewBoxGraphiqueCyclo } from "../ui6e/formatGraphiquesCyclometriques";
import { construireSvgFonction } from "../../export/svgGraph";

/**
 * Habillage `6gen5`-spécifique (Apparier graphiques et expressions de fonctions cyclométriques) du
 * moteur de tracé générique `export/svgGraph.ts` — ne fait qu'adapter `evaluerCandidat` (déjà pur,
 * `ui6e/formatGraphiquesCyclometriques.ts`) au contrat `construireSvgFonction`, et dispose les
 * candidats d'une instance en grille lettrée A, B, C… pour l'énoncé/le corrigé.
 */

const LETTRES = "ABCDEF";

export interface OptionsSvgCandidatCyclo {
  lettre: string;
  /** Liseré vert + coche — réservé au corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
  estCorrect?: boolean;
}

export function construireSvgCandidatCyclo(
  exercice: ExerciceGraphiquesCyclometriques,
  index: number,
  viewBox: ViewBoxGraphiqueCyclo,
  options: OptionsSvgCandidatCyclo,
): string {
  return construireSvgFonction((x) => evaluerCandidat(exercice, index, x), viewBox, options);
}

/** Les candidats d'une instance (4 pour la plupart des familles, voir
 * `core6e/graphiquesCyclometriques.types.ts`), lettrés A, B, C…, disposés en grille ; `estCorrect`
 * réservé au corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
export function construireGrilleSvgCandidatsCyclo(exercice: ExerciceGraphiquesCyclometriques, viewBox: ViewBoxGraphiqueCyclo, indexCorrectAAfficher?: number): string {
  const svgs = exercice.candidats
    .map((_, i) => construireSvgCandidatCyclo(exercice, i, viewBox, { lettre: LETTRES[i] ?? String(i + 1), estCorrect: indexCorrectAAfficher === i }))
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}
