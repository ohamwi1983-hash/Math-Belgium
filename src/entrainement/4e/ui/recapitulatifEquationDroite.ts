import type { EtatSessionEquationDroite } from "../moteur/typesEquationDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelPointVecteurLatex } from "./formatEquationDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — une seule entrée possible : le point + vecteur directeur
 * confirmés à l'écran "extraction" (TOUJOURS le premier écran, quel que soit le chemin suivi
 * ensuite — `implicite`/`parametrique`/`explicite_y`/`explicite_x`, voir `PhaseEquationDroite`
 * dans `typesEquationDroite.ts`) ; l'écran suivant est toujours le dernier, il n'a donc jamais
 * d'entrée propre. Réutilise TELLE QUELLE
 * `formatEtatActuelPointVecteurLatex` (déjà écrite pour l'ancien bloc), toujours dérivée de
 * `exercice` lui-même (jamais de la saisie de l'élève).
 */
export function calculerRecapitulatifEquationDroite(etat: EtatSessionEquationDroite): EntreeRecapitulatif[] {
  if (etat.scoreExtractionExercice === null) return [];

  return [
    {
      libelle: "Point et vecteur directeur",
      estLatex: true,
      // `\displaystyle` : sans lui, la colonne du vecteur (pmatrix) est rendue en taille de texte
      // en ligne, illisible (audit chapitre 7, point 8).
      valeur: `\\displaystyle ${formatEtatActuelPointVecteurLatex(etat.exerciceCourant)}`,
      revele: etat.extractionRevele,
    },
  ];
}
