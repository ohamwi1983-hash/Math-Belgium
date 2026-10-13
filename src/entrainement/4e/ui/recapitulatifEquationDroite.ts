import type { EtatSessionEquationDroite } from "../moteur/typesEquationDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelPointVecteurLatex } from "./formatEquationDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — une seule entrée possible : le point + vecteur directeur
 * confirmés à l'écran "extraction" (TOUJOURS le premier écran, quel que soit le chemin suivi
 * ensuite — `implicite`/`parametrique`/`explicite_y`/`explicite_x`, voir `PhaseEquationDroite`
 * dans `typesEquationDroite.ts`). Les autres écrans intermédiaires ("possibilite") n'ont jamais eu
 * de valeur affichée par l'ancien bloc "état actuel" des écrans suivants (qui ne rappelaient QUE
 * le point/vecteur, voir chaque `EtapeXxxEquationDroite.tsx` concerné) : aucune entrée
 * supplémentaire n'est donc nécessaire ici. Réutilise TELLE QUELLE
 * `formatEtatActuelPointVecteurLatex` (déjà écrite pour l'ancien bloc), toujours dérivée de
 * `exercice` lui-même (jamais de la saisie de l'élève).
 */
export function calculerRecapitulatifEquationDroite(etat: EtatSessionEquationDroite): EntreeRecapitulatif[] {
  if (etat.scoreExtractionExercice === null) return [];

  return [
    {
      libelle: "Point et vecteur directeur",
      estLatex: true,
      valeur: formatEtatActuelPointVecteurLatex(etat.exerciceCourant),
      revele: etat.extractionRevele,
    },
  ];
}
