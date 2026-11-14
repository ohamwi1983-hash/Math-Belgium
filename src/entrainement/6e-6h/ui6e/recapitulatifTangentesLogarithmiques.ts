import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionTangentesLog } from "../moteur6e/typesTangentesLogarithmiques";
import { phasesExercice } from "../moteur6e/typesTangentesLogarithmiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttendueLatex, libellePhase } from "./formatTangentesLogarithmiques";

/**
 * « Ce qu'on sait déjà » de `6gen87` : réponse confirmée de chaque écran clos (valeurs attendues en
 * LaTeX), ✓ ou ✗ selon qu'elle a été trouvée.
 */
export function calculerRecapitulatifTangentesLog(etat: EtatSessionTangentesLog): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesExercice(e);
  const index = phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const formules = formatReponseAttendueLatex(e, phase);
    return {
      libelle: libellePhase(e, phase),
      valeur: "",
      estLatex: true,
      revele: etat.revelesPartiels[phase] ?? false,
      valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\qquad` : x)),
    };
  });
}

/** Une puce par écran de la chaîne de cet exercice. */
export function calculerSegmentsProgressionTangentesLog(etat: EtatSessionTangentesLog, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
