import type { EtatSessionArbreTableauEffectifs } from "../moteur6e/typesArbreTableauEffectifs";
import { phasesPourExercice } from "../moteur6e/typesArbreTableauEffectifs";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatArbreTableauEffectifs";

/** Récapitulatif des écrans clos de `6gen74` — valeurs CONFIRMÉES (jamais la saisie de l'élève),
 * même patron que `recapitulatifIndependanceBayes.ts`. */
export function calculerRecapitulatifArbreTableauEffectifs(etat: EtatSessionArbreTableauEffectifs): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));
  return precedentes.map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

export function calculerSegmentsProgressionArbreTableauEffectifs(etat: EtatSessionArbreTableauEffectifs) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
