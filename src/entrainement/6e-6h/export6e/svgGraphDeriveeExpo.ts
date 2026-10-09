import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import { evaluerCandidat, type ViewBoxGraphiqueDeriveeExpo } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { construireSvgFonction } from "../../export/svgGraph";

/**
 * Habillage `6gen8`-spécifique (Graphique de la dérivée, fonctions exponentielles) du moteur de
 * tracé générique `export/svgGraph.ts` — même principe que `export/svgGraphCyclo.ts` (6gen5) : ne
 * fait qu'adapter `evaluerCandidat` (déjà pur, `ui6e/formatGraphiquesDeriveeExponentielles.ts`) au
 * contrat `construireSvgFonction`, et dispose les candidats d'une instance en grille lettrée A-D.
 */

const LETTRES = "ABCD";

export interface OptionsSvgCandidatDeriveeExpo {
  lettre: string;
  /** Liseré vert + coche — réservé au corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
  estCorrect?: boolean;
}

export function construireSvgCandidatDeriveeExpo(
  exercice: ExerciceGraphiqueDeriveeExponentielle,
  index: number,
  viewBox: ViewBoxGraphiqueDeriveeExpo,
  options: OptionsSvgCandidatDeriveeExpo,
): string {
  return construireSvgFonction((x) => evaluerCandidat(exercice, index, x), viewBox, options);
}

/** Les 4 candidats d'une instance, lettrés A-D, disposés en grille ; `estCorrect` réservé au
 * corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
export function construireGrilleSvgCandidatsDeriveeExpo(
  exercice: ExerciceGraphiqueDeriveeExponentielle,
  viewBox: ViewBoxGraphiqueDeriveeExpo,
  indexCorrectAAfficher?: number,
): string {
  const svgs = exercice.candidats
    .map((_, i) => construireSvgCandidatDeriveeExpo(exercice, i, viewBox, { lettre: LETTRES[i] ?? String(i + 1), estCorrect: indexCorrectAAfficher === i }))
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}
