import type { EtatSessionFormeTrigonometrique } from "../moteur6e/typesFormeTrigonometrique";
import { phasesPourExercice } from "../moteur6e/typesFormeTrigonometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatFormeTrigonometrique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatFormeTrigonometrique.ts`/`typesFormeTrigonometrique.ts` — jamais une logique recalculée
 * séparément.
 */
export function calculerRecapitulatifFormeTrigonometrique(etat: EtatSessionFormeTrigonometrique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/sous-types. */
export function calculerSegmentsProgressionFormeTrigonometrique(etat: EtatSessionFormeTrigonometrique) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
