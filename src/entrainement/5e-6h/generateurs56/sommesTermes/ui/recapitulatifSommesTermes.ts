// Copie 5e (6h) de `5e-4h/ui5e/recapitulatifSommesTermes.ts` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { EtatPuceProgression } from "../../../../components/ProgressionPuces";
import { phasesPourExercice } from "../moteur/typesSommesTermes";
import type { EtatSessionSommesTermes } from "../moteur/typesSommesTermes";
import type { EntreeRecapitulatif } from "../../../../5e-4h/ui5e/recapitulatif";
import { libellePhase, reponseRecap } from "./formatSommesTermes";

/** « Ce qu'on sait déjà » de `5gen45` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifSommesTermes(etat: EtatSessionSommesTermes): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const valeurs = reponseRecap(e, phase);
    return {
      libelle: libellePhase(phase),
      valeur: "",
      estLatex: true,
      revele: etat.revelesPartiels[phase] ?? false,
      valeurs: valeurs.map((x, i) => (i < valeurs.length - 1 ? `${x}\\;;` : x)),
    };
  });
}

/** Une puce par écran. */
export function calculerSegmentsProgressionSommesTermes(etat: EtatSessionSommesTermes, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
