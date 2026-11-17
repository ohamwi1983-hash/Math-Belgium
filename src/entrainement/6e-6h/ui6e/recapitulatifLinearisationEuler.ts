import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { phasesPourExercice } from "../moteur6e/typesLinearisationEuler";
import type { EtatSessionLinearisation } from "../moteur6e/typesLinearisationEuler";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libellePhase, reponseRecap } from "./formatLinearisationEuler";

/** « Ce qu'on sait déjà » de `6gen93` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifLinearisation(etat: EtatSessionLinearisation): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => ({ libelle: libellePhase(phase), valeur: reponseRecap(e, phase), estLatex: true, revele: etat.revelesPartiels[phase] ?? false }));
}

/** Une puce par écran. */
export function calculerSegmentsProgressionLinearisation(etat: EtatSessionLinearisation, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
