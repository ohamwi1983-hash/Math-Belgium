import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { PHASES_DEUX_ECRITURES } from "../moteur6e/typesDeuxEcritures";
import type { EtatSessionDeuxEcritures } from "../moteur6e/typesDeuxEcritures";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libellePhase, reponseRecap } from "./formatDeuxEcritures";

/** « Ce qu'on sait déjà » de `6gen94` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifDeuxEcritures(etat: EtatSessionDeuxEcritures): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = etat.terminee ? PHASES_DEUX_ECRITURES.length : PHASES_DEUX_ECRITURES.indexOf(etat.phase);
  return PHASES_DEUX_ECRITURES.slice(0, index).map((phase) => ({ libelle: libellePhase(phase), valeur: reponseRecap(e, phase), estLatex: true, revele: etat.revelesPartiels[phase] ?? false }));
}

/** Une puce par écran. */
export function calculerSegmentsProgressionDeuxEcritures(etat: EtatSessionDeuxEcritures, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_DEUX_ECRITURES.length : PHASES_DEUX_ECRITURES.indexOf(etat.phase);
  return PHASES_DEUX_ECRITURES.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
