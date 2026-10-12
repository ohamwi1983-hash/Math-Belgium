import type { EtatSessionQuellePrimitive, PhaseQuellePrimitive } from "../moteur6e/typesQuellePrimitive";
import { phasesPourExercice } from "../moteur6e/typesQuellePrimitive";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatexQuellePrimitive } from "./formatQuellePrimitive";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatexQuellePrimitive` de `formatQuellePrimitive.ts` et
 * `phasesPourExercice` de `moteur6e/typesQuellePrimitive.ts` — jamais une logique recalculée
 * séparément (même patron que `recapitulatifEquationsExpLog.ts`, 6gen14).
 */
export function calculerRecapitulatifQuellePrimitive(etat: EtatSessionQuellePrimitive): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseQuellePrimitive) => {
    const valeurs = formatReponseAttenduePhaseLatexQuellePrimitive(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice précis (`phasesPourExercice`). */
export function calculerSegmentsProgressionQuellePrimitive(etat: EtatSessionQuellePrimitive) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
