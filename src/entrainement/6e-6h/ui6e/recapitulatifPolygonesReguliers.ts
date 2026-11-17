import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionPolygones } from "../moteur6e/typesPolygonesReguliers";
import { phasesDe } from "../moteur6e/typesPolygonesReguliers";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, valeurRecapitulatif } from "./formatPolygonesReguliers";

/** « Ce qu'on sait déjà » de `6gen97` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifPolygones(etat: EtatSessionPolygones): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesDe(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => ({ libelle: LIBELLE_PHASE[phase], revele: etat.revelesPartiels[phase] ?? false, ...valeurRecapitulatif(e, phase) }));
}

/** Une puce par écran (chaîne fixe de 4). */
export function calculerSegmentsProgressionPolygones(etat: EtatSessionPolygones): EtatPuceProgression[] {
  const phases = phasesDe(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
