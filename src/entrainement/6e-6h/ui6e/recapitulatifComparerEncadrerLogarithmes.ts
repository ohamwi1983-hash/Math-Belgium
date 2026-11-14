import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionComparerEncadrerLog } from "../moteur6e/typesComparerEncadrerLogarithmes";
import { estPhaseChoix, phasesExercice } from "../moteur6e/typesComparerEncadrerLogarithmes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttendueLatex, libellePhase, optionCorrecteFragments } from "./formatComparerEncadrerLogarithmes";

/**
 * « Ce qu'on sait déjà » de `6gen86` : réponse confirmée de chaque écran clos (choix fermé : son
 * énoncé en LaTeX ; champs : les valeurs attendues), ✓ ou ✗ selon qu'elle a été trouvée.
 */
export function calculerRecapitulatifComparerEncadrerLog(etat: EtatSessionComparerEncadrerLog): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesExercice(e);
  const index = phases.indexOf(etat.phase);
  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of phases.slice(0, index)) {
    const revele = etat.revelesPartiels[phase] ?? false;
    const libelle = libellePhase(e, phase);
    const formules = estPhaseChoix(phase)
      ? optionCorrecteFragments(e, phase).flatMap((f) => (f.type === "latex" ? [f.valeur] : [])).slice(0, 1)
      : formatReponseAttendueLatex(e, phase);
    entrees.push({ libelle, valeur: "", estLatex: true, revele, valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\qquad` : x)) });
  }
  return entrees;
}

/** Une puce par écran de la chaîne de cet exercice. */
export function calculerSegmentsProgressionComparerEncadrerLog(etat: EtatSessionComparerEncadrerLog, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
