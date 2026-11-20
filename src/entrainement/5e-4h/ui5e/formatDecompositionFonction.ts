import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import type { AideTrig } from "./aidesTrigonometrie";

export const TEXTE_AIDE_NIVEAU1 = "Quelle est la dernière opération appliquée à l'ensemble de l'expression ?";

/** Aide niveau 2 : désigne la portion d'expression concernée par la couche extérieure, SANS la
 * nommer — révèle l'argument de la dernière couche (`argumentLatex`), jamais l'opération elle-même. */
export function texteAideNiveau2(exercice: ExerciceDecompositionFonction): { avant: string; latex: string } {
  const derniere = exercice.couches[exercice.couches.length - 1];
  return { avant: "L'opération finale s'applique à l'expression : ", latex: derniere.argumentLatex };
}

export const TEXTE_AIDE_NIVEAU3_AFFINE_FINALE = "Cette dernière étape s'applique au résultat de la couche précédente, pas directement à x.";

/** Aides de 5gen2 (audit 5e ch. 1, lot B) : niveau 1 la méthode du cours (exemple chiffré à part),
 * niveau 2 l'argument de la dernière opération dans CETTE fonction, niveau 3 (dernière couche
 * affine seulement) le piège de la couche affine finale. Jamais la décomposition elle-même. */
export function aidesDecomposition(exercice: ExerciceDecompositionFonction): AideTrig[] {
  const aides: AideTrig[] = [
    {
      texte: [
        { type: "texte", valeur: "Calcule f(x) pour un x précis : l'opération faite en dernier est la fonction la plus extérieure, celle faite en premier la plus intérieure. Par exemple :" },
      ],
      formules: ["\\sqrt{2x+1}\\ :\\ g(x)=2x+1,\\quad h(x)=\\sqrt{x}"],
    },
    { texte: [{ type: "texte", valeur: "Ici, l'opération finale s'applique à l'expression :" }], formules: [texteAideNiveau2(exercice).latex] },
  ];
  if (exercice.couches[exercice.couches.length - 1].estAffineFinale) aides.push({ texte: [{ type: "texte", valeur: TEXTE_AIDE_NIVEAU3_AFFINE_FINALE }] });
  return aides;
}

const LETTRES_COUCHES = ["g", "h", "i", "j", "k", "l", "m", "n"];

export function labelLigne(index: number): string {
  const lettre = LETTRES_COUCHES[index] ?? `f_{${index}}`;
  return `${lettre}(x) =`;
}
