import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionLireCourbeLogarithmique } from "../moteur6e/typesLireCourbeLogarithmique";
import { phasesExercice } from "../moteur6e/typesLireCourbeLogarithmique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatLireCourbeLogarithmique";

/** « Ce qu'on sait déjà » de `6gen85` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifLireCourbeLogarithmique(etat: EtatSessionLireCourbeLogarithmique): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesExercice(e);
  return phases.slice(0, phases.indexOf(etat.phase)).map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: libellePhase(e, phase), valeur: valeurs.join(" \\quad "), estLatex: true, revele: etat.revelesPartiels[phase] ?? false, valeurs };
  });
}

export function calculerSegmentsProgressionLireCourbeLogarithmique(etat: EtatSessionLireCourbeLogarithmique, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
