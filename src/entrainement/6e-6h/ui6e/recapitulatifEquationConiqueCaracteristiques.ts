import type { EtatSessionEquationConiqueCaracteristiques, PhaseEquationConiqueCaracteristiques } from "../moteur6e/typesEquationConiqueCaracteristiques";
import { phasesPourExercice } from "../moteur6e/typesEquationConiqueCaracteristiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatEquationConiqueCaracteristiques";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatEquationConiqueCaracteristiques.ts`/`typesEquationConiqueCaracteristiques.ts` — jamais une
 * logique recalculée séparément. `phasesPourExercice` dépend ici UNIQUEMENT de la famille/sous-type
 * de l'exercice (jamais d'une propriété numérique tirée, voir en-tête de
 * `typesEquationConiqueCaracteristiques.ts`).
 */
export function calculerRecapitulatifEquationConiqueCaracteristiques(etat: EtatSessionEquationConiqueCaracteristiques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseEquationConiqueCaracteristiques) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/sous-types. */
export function calculerSegmentsProgressionEquationConiqueCaracteristiques(etat: EtatSessionEquationConiqueCaracteristiques) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
