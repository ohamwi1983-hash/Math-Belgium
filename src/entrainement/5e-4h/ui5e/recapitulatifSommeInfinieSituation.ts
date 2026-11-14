import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { PHASES } from "../moteur5e/typesSommeInfinieSituation";
import type { EtatSessionSommeInfinie } from "../moteur5e/typesSommeInfinieSituation";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleRecap, reponseRecap } from "./formatSommeInfinieSituation";

/** « Ce qu'on sait déjà » de `5gen48` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifSommeInfinie(etat: EtatSessionSommeInfinie): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = etat.terminee ? PHASES.length : PHASES.indexOf(etat.phase);
  return PHASES.slice(0, index).map((phase) => ({
    libelle: libelleRecap(e, phase),
    valeur: "",
    estLatex: true,
    revele: etat.revelesPartiels[phase] ?? false,
    valeurs: [reponseRecap(e, phase)],
  }));
}

/** Une puce par écran. */
export function calculerSegmentsProgressionSommeInfinie(etat: EtatSessionSommeInfinie, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES.length : PHASES.indexOf(etat.phase);
  return PHASES.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
