import type { EtatSessionExponentiellesProblemes, PhaseExponentiellesProblemes } from "../moteur6e/typesExponentiellesProblemes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, PHASES_PAR_FAMILLE, formatReponseAttenduePhaseLatex } from "./formatExponentiellesProblemes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`PHASES_PAR_FAMILLE`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatExponentiellesProblemes.ts` — jamais une logique recalculée séparément (même patron que
 * `recapitulatifEquationsExpLog.ts`, 6gen14).
 */
export function calculerRecapitulatifExponentiellesProblemes(etat: EtatSessionExponentiellesProblemes): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = PHASES_PAR_FAMILLE[exercice.famille];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseExponentiellesProblemes) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`PHASES_PAR_FAMILLE`),
 * jamais une séquence fixe commune aux 7 familles. */
export function calculerSegmentsProgressionExponentiellesProblemes(etat: EtatSessionExponentiellesProblemes) {
  const sequence = PHASES_PAR_FAMILLE[etat.exerciceCourant.famille];
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
