import type { EtatSessionDenombrementCombinatoirePur, PhaseDenombrementCombinatoirePur } from "../moteur6e/typesDenombrementCombinatoirePur";
import { phasesPourExercice } from "../moteur6e/typesDenombrementCombinatoirePur";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatDenombrementCombinatoirePur";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatDenombrementCombinatoirePur.ts`/`typesDenombrementCombinatoirePur.ts` — jamais une
 * logique recalculée séparément.
 */
export function calculerRecapitulatifDenombrementCombinatoirePur(etat: EtatSessionDenombrementCombinatoirePur): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseDenombrementCombinatoirePur) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice (`phasesPourExercice`), jamais une
 * séquence fixe commune aux familles. */
export function calculerSegmentsProgressionDenombrementCombinatoirePur(etat: EtatSessionDenombrementCombinatoirePur) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
