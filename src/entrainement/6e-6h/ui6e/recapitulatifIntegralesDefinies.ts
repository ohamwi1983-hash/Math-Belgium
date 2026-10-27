import type { EtatSessionIntegralesDefinies, PhaseIntegralesDefinies } from "../moteur6e/typesIntegralesDefinies";
import { phasesPourExercice } from "../moteur6e/typesIntegralesDefinies";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatIntegralesDefinies";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatex` de `formatIntegralesDefinies.ts` et
 * `phasesPourExercice` de `moteur6e/typesIntegralesDefinies.ts` — jamais une logique recalculée
 * séparément (même patron que `recapitulatifEquationsExpLog.ts`, 6gen14).
 */
export function calculerRecapitulatifIntegralesDefinies(etat: EtatSessionIntegralesDefinies): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseIntegralesDefinies) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice précis (`phasesPourExercice`). */
export function calculerSegmentsProgressionIntegralesDefinies(etat: EtatSessionIntegralesDefinies) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
