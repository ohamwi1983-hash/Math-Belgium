import type { EtatSessionCombinaisonVecteurs } from "../moteur/typesCombinaisonVecteurs";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEquationReduiteLatex } from "./formatCombinaisonVecteurs";

/**
 * Récapitulatif de "Calcul de composantes de combinaisons linéaires" — même principe que le reste
 * du projet (dérivé uniquement du score déjà tracké par le moteur, jamais de la saisie de l'élève) :
 * vide tant que l'écran "simplification" n'est pas confirmé (l'écran lui-même, rien à récapituler
 * avant elle), une entrée "Expression réduite" une fois confirmé — toujours la vraie forme réduite
 * (`formatEquationReduiteLatex`, la même source que la révélation du panneau de résultat, jamais un
 * second calcul indépendant). Affiché sur l'écran "composantes".
 */
export function calculerRecapitulatifCombinaisonVecteurs(etat: EtatSessionCombinaisonVecteurs): EntreeRecapitulatif[] {
  if (etat.scoreSimplificationExercice === null) return [];

  return [
    {
      libelle: "Expression réduite",
      estLatex: true,
      valeur: formatEquationReduiteLatex(etat.exerciceCourant),
    },
  ];
}
