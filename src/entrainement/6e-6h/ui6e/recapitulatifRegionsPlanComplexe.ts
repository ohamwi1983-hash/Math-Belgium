import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionRegions } from "../moteur6e/typesRegionsPlanComplexe";
import { PHASES_REGIONS } from "../moteur6e/typesRegionsPlanComplexe";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, valeurRecapitulatif } from "./formatRegionsPlanComplexe";

/** « Ce qu'on sait déjà » de `6gen98` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifRegions(etat: EtatSessionRegions): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = etat.terminee ? PHASES_REGIONS.length : PHASES_REGIONS.indexOf(etat.phase);
  return PHASES_REGIONS.slice(0, index).map((phase) => ({ libelle: LIBELLE_PHASE[phase], revele: etat.revelesPartiels[phase] ?? false, ...valeurRecapitulatif(e, phase) }));
}

/** Une puce par écran (chaîne fixe de 4). */
export function calculerSegmentsProgressionRegions(etat: EtatSessionRegions): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_REGIONS.length : PHASES_REGIONS.indexOf(etat.phase);
  return PHASES_REGIONS.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
