import type { EtatSessionProbabilitesEnsembles } from "../moteur6e/typesProbabilitesEnsembles";
import { phasesPourExercice } from "../moteur6e/typesProbabilitesEnsembles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatProbabilitesEnsembles";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatProbabilitesEnsembles.ts`/`typesProbabilitesEnsembles.ts` — jamais une logique recalculée
 * séparément.
 */
export function calculerRecapitulatifProbabilitesEnsembles(etat: EtatSessionProbabilitesEnsembles): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 2 familles (longueur fixe mais DIFFÉRENTE : 3 pour A, 4 pour B). */
export function calculerSegmentsProgressionProbabilitesEnsembles(etat: EtatSessionProbabilitesEnsembles) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
