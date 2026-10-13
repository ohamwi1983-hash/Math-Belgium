import type { EtatSessionConstructionDroite } from "../moteur/typesConstructionDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelPointsLatex } from "./formatConstructionDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 2 phases FIXES (`points` puis `trace`, voir
 * `moteur/typesConstructionDroite.ts`) : seule la phase "points" peut précéder un écran suivant,
 * donc la seule entrée possible est "Points trouvés", reprise TELLE QUELLE de l'ancien
 * `EtatActuelPanel` de `EtapeTraceConstructionDroite.tsx` (`formatEtatActuelPointsLatex`). La
 * phase "trace" est toujours la dernière et n'a donc jamais d'entrée dans son propre récap.
 */
export function calculerRecapitulatifConstructionDroite(etat: EtatSessionConstructionDroite): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scorePointsExercice !== null && etat.cible1 !== null && etat.cible2 !== null) {
    entrees.push({
      libelle: "Points trouvés",
      estLatex: true,
      valeur: formatEtatActuelPointsLatex(etat.cible1, etat.cible2),
      revele: etat.pointsRevele,
    });
  }

  return entrees;
}
