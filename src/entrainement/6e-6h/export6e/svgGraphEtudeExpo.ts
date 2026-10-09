import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import { evaluerCandidat, type ViewBoxEtudeFonction } from "../ui6e/formatEtudeFonctionExponentielle";
import { construireSvgFonction } from "../../export/svgGraph";

/**
 * Habillage `6gen11`-spécifique (Étude complète d'une fonction exponentielle) du moteur de tracé
 * générique `export/svgGraph.ts` — même principe que `export/svgGraphCyclo.ts` (6gen5) et
 * `export/svgGraphDeriveeExpo.ts` (6gen8) : ne fait qu'adapter `evaluerCandidat` (déjà pur,
 * `ui6e/formatEtudeFonctionExponentielle.ts`) au contrat `construireSvgFonction`, et dispose les 4
 * candidats d'une instance en grille lettrée A-D.
 */

const LETTRES = "ABCD";

export interface OptionsSvgCandidatEtudeExpo {
  lettre: string;
  /** Liseré vert + coche — réservé au corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
  estCorrect?: boolean;
}

export function construireSvgCandidatEtudeExpo(
  exercice: ExerciceEtudeFonctionExponentielle,
  index: number,
  viewBox: ViewBoxEtudeFonction,
  options: OptionsSvgCandidatEtudeExpo,
): string {
  return construireSvgFonction((x) => evaluerCandidat(exercice, index, x), viewBox, options);
}

/** Les 4 candidats d'une instance, lettrés A-D, disposés en grille ; `estCorrect` réservé au
 * corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
export function construireGrilleSvgCandidatsEtudeExpo(
  exercice: ExerciceEtudeFonctionExponentielle,
  viewBox: ViewBoxEtudeFonction,
  indexCorrectAAfficher?: number,
): string {
  const svgs = exercice.candidats
    .map((_, i) => construireSvgCandidatEtudeExpo(exercice, i, viewBox, { lettre: LETTRES[i] ?? String(i + 1), estCorrect: indexCorrectAAfficher === i }))
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}
