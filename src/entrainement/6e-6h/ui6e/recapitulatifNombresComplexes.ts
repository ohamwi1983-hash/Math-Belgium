import type { EtatSessionNombresComplexes } from "../moteur6e/typesNombresComplexes";
import { phasesPourExercice } from "../moteur6e/typesNombresComplexes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatNombresComplexes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatNombresComplexes.ts`/`typesNombresComplexes.ts` — jamais une logique recalculée
 * séparément.
 */
export function calculerRecapitulatifNombresComplexes(etat: EtatSessionNombresComplexes): EntreeRecapitulatif[] {
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
export function calculerSegmentsProgressionNombresComplexes(etat: EtatSessionNombresComplexes) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
