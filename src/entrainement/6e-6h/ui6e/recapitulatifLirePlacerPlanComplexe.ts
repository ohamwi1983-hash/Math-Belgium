import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionLirePlacer } from "../moteur6e/typesLirePlacerPlanComplexe";
import { PHASES_LIRE_PLACER } from "../moteur6e/typesLirePlacerPlanComplexe";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, valeurRecapitulatif } from "./formatLirePlacerPlanComplexe";

/** « Ce qu'on sait déjà » de `6gen95` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifLirePlacer(etat: EtatSessionLirePlacer): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = etat.terminee ? PHASES_LIRE_PLACER.length : PHASES_LIRE_PLACER.indexOf(etat.phase);
  return PHASES_LIRE_PLACER.slice(0, index).map((phase) => ({ libelle: LIBELLE_PHASE[phase], revele: etat.revelesPartiels[phase] ?? false, ...valeurRecapitulatif(e, phase) }));
}

/** Une puce par écran (chaîne fixe de 5). */
export function calculerSegmentsProgressionLirePlacer(etat: EtatSessionLirePlacer): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_LIRE_PLACER.length : PHASES_LIRE_PLACER.indexOf(etat.phase);
  return PHASES_LIRE_PLACER.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
