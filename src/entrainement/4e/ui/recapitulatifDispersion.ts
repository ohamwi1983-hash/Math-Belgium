import type { EtatSessionDispersion } from "../moteur/typesDispersion";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelTableauLatex, formatMoyenneConfirmeeLatex } from "./formatDispersion";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 2 phases FIXES (`tableau` → `varianceEcartType`, toujours
 * terminale, voir `moteur/typesDispersion.ts`). Seule "tableau" précède un écran suivant : son
 * entrée reprend TELLE QUELLE l'ancien bloc "état actuel" de `EtapeVarianceEcartTypeDispersion.tsx`
 * (PARTAGÉ avec `AppExerciceSynthese` — même sémantique dans les 2 Apps : "tableau" précède
 * toujours immédiatement "varianceEcartType").
 */
export function calculerRecapitulatifDispersion(etat: EtatSessionDispersion): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];

  // Famille "classes" : x̄ confirmé à l'écran « centres et moyenne » (les centres sont repris dans
  // la colonne xᵢ du tableau de l'écran suivant).
  if (etat.scoreCentresMoyenneExercice !== null) {
    entrees.push({
      libelle: "Moyenne confirmée",
      estLatex: true,
      valeur: formatMoyenneConfirmeeLatex(etat.exerciceCourant),
      revele: etat.centresMoyenneRevele,
    });
  }

  if (etat.scoreTableauExercice !== null) {
    entrees.push({
      libelle: "Sommes confirmées",
      estLatex: true,
      valeur: formatEtatActuelTableauLatex(etat.exerciceCourant),
      revele: etat.tableauRevele,
    });
  }

  return entrees;
}
