import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionOptimiserLog } from "../moteur6e/typesOptimiserModeleLog";
import { PHASES_OPTIMISER_LOG } from "../moteur6e/typesOptimiserModeleLog";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatOptimiserModeleLog";

/** « Ce qu'on sait déjà » de `6gen91` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifOptimiserLog(etat: EtatSessionOptimiserLog): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = PHASES_OPTIMISER_LOG.indexOf(etat.phase);
  return PHASES_OPTIMISER_LOG.slice(0, index).map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: LIBELLE_PHASE[phase], valeur: valeurs.join(" "), estLatex: true, revele: etat.revelesPartiels[phase] ?? false, valeurs };
  });
}

/** Une puce par écran (chaîne fixe de 5). */
export function calculerSegmentsProgressionOptimiserLog(etat: EtatSessionOptimiserLog): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_OPTIMISER_LOG.length : PHASES_OPTIMISER_LOG.indexOf(etat.phase);
  return PHASES_OPTIMISER_LOG.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
