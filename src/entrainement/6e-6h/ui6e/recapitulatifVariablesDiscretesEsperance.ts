import type { EtatSessionVariablesDiscretesEsperance, PhaseVariablesDiscretesEsperance } from "../moteur6e/typesVariablesDiscretesEsperance";
import { phasesPourExercice } from "../moteur6e/typesVariablesDiscretesEsperance";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatVariablesDiscretesEsperance";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatex` déjà exportés par
 * `formatVariablesDiscretesEsperance.ts`, et `phasesPourExercice` déjà exporté par
 * `typesVariablesDiscretesEsperance.ts` (séquence réelle de CET exercice, nommée par
 * famille+sous-type quand le nombre d'écrans en dépend) — jamais une logique recalculée
 * séparément. Mirroir `recapitulatifEquationsExpLog.ts` (6gen14).
 */
export function calculerRecapitulatifVariablesDiscretesEsperance(etat: EtatSessionVariablesDiscretesEsperance): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseVariablesDiscretesEsperance) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/sous-types. */
export function calculerSegmentsProgressionVariablesDiscretesEsperance(etat: EtatSessionVariablesDiscretesEsperance) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
