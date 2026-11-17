import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { PHASES_IMPEDANCES } from "../moteur6e/typesImpedances";
import type { EtatSessionImpedances } from "../moteur6e/typesImpedances";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libellePhase, reponseRecap } from "./formatImpedances";

/** « Ce qu'on sait déjà » de `6gen96` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifImpedances(etat: EtatSessionImpedances): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = etat.terminee ? PHASES_IMPEDANCES.length : PHASES_IMPEDANCES.indexOf(etat.phase);
  return PHASES_IMPEDANCES.slice(0, index).map((phase) => ({ libelle: libellePhase(phase), valeur: reponseRecap(e, phase), estLatex: true, revele: etat.revelesPartiels[phase] ?? false }));
}

/** Une puce par écran. */
export function calculerSegmentsProgressionImpedances(etat: EtatSessionImpedances, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_IMPEDANCES.length : PHASES_IMPEDANCES.indexOf(etat.phase);
  return PHASES_IMPEDANCES.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
