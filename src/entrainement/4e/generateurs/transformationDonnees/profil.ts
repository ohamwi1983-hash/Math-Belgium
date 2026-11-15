import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTransformationDonnees } from "../../core/transformationDonnees.types";

/**
 * Profil d'instance de gen108 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe la nature de la transformation (constante, multiplication, affine).
 * - `forme` = signature de difficulté à l'intérieur de la variante, tirée AVANT le contexte avec des
 *   poids fixes (`generateurs/transformationDonnees/index.ts`) : multiplication → `pourcentage`
 *   (a = 1 ± t/100 à calculer) ou `facteur` (changement d'unité) ; affine → `direct` (« × a puis
 *   + b »), `avant` (constante ajoutée AVANT la multiplication : b = a·c à calculer) ou `negatif`
 *   (y = b − x, valeur absolue de a). Mesures (5 000 tirages par variante, scratchpad gen108) :
 *   pourcentage ≈ 50 %, facteur ≈ 50 % ; direct ≈ 45 %, avant ≈ 35 %, negatif ≈ 20 % — la plus rare
 *   attendue ≈ 4 000 fois sur 20 000 essais, très loin du seuil de ~5.
 * - Aucun cas particulier : toutes les étapes sont toujours à faire (le type « constante » est une
 *   VARIANTE, pas un raccourci tiré au hasard).
 * - `calcul` : `'exacte'` quand a rend tous les produits faisables à la main (entier simple, 60,
 *   puissance de 10, 0,5, −1) ; `'calculatrice'` sinon (1,03 ; 1,8 ; 0,8 ; 1,1…). Variante
 *   « constante » : seulement des additions → `calcul` sans objet (absent).
 */
const A_EXACTS = [-1, 0.001, 0.5, 2, 5, 60, 1000];

export function calculTransformation(e: ExerciceTransformationDonnees): "exacte" | "calculatrice" | undefined {
  if (e.forme === "constante") return undefined;
  return A_EXACTS.some((a) => Math.abs(a - e.a) < 1e-9) ? "exacte" : "calculatrice";
}

export function formeTransformation(e: ExerciceTransformationDonnees): string {
  return `${e.type}:${e.forme}`;
}

export function profilTransformationDonnees(e: ExerciceTransformationDonnees): ProfilInstance {
  const calcul = calculTransformation(e);
  return { casParticulier: null, forme: formeTransformation(e), ...(calcul ? { calcul } : {}) };
}
