import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";

export const TEXTE_AIDE_NIVEAU1 = "Quelle est la dernière opération appliquée à l'ensemble de l'expression ?";

/** Aide niveau 2 : désigne la portion d'expression concernée par la couche extérieure, SANS la
 * nommer — révèle l'argument de la dernière couche (`argumentLatex`), jamais l'opération elle-même. */
export function texteAideNiveau2(exercice: ExerciceDecompositionFonction): { avant: string; latex: string } {
  const derniere = exercice.couches[exercice.couches.length - 1];
  return { avant: "L'opération finale s'applique à l'expression : ", latex: derniere.argumentLatex };
}

export const TEXTE_AIDE_NIVEAU3_AFFINE_FINALE = "Cette dernière étape s'applique au RÉSULTAT de la couche précédente, pas directement à x.";

const LETTRES_COUCHES = ["g", "h", "i", "j", "k", "l", "m", "n"];

export function labelLigne(index: number): string {
  const lettre = LETTRES_COUCHES[index] ?? `f_{${index}}`;
  return `${lettre}(x) =`;
}
