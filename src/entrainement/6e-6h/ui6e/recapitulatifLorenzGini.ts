import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { estPhaseChoix, phasesPourExercice } from "../moteur6e/typesLorenzGini";
import type { EtatSessionLorenz } from "../moteur6e/typesLorenzGini";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase, reponseChoix } from "./formatLorenzGini";

/**
 * « Ce qu'on sait déjà » de `6gen82` : valeurs confirmées des écrans clos (la phrase juste pour
 * l'interprétation et le verdict), jamais la saisie de l'élève.
 */
export function calculerRecapitulatifLorenz(etat: EtatSessionLorenz): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    if (estPhaseChoix(phase)) {
      const texte = reponseChoix(e, phase)
        .map((f) => f.valeur)
        .join("");
      return { libelle: libellePhase(e, phase), valeur: texte, estLatex: false, revele };
    }
    const formules = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: libellePhase(e, phase), valeur: "", estLatex: true, revele, valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\;;` : x)) };
  });
}

/** Une puce par écran. */
export function calculerSegmentsProgressionLorenz(etat: EtatSessionLorenz, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
