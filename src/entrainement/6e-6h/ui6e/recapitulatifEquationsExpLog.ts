import type { EtatSessionEquationsExpLog, PhaseEquationsExpLog } from "../moteur6e/typesEquationsExpLog";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, PHASES_PAR_FAMILLE, formatReponseAttenduePhaseLatex } from "./formatEquationsExpLog";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`PHASES_PAR_FAMILLE`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatEquationsExpLog.ts` pour l'ancien récapitulatif final (devenus inutilisés depuis le passage
 * de ce générateur à la validation inline) — jamais une logique recalculée séparément.
 */
export function calculerRecapitulatifEquationsExpLog(etat: EtatSessionEquationsExpLog): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = PHASES_PAR_FAMILLE[exercice.famille];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseEquationsExpLog) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`PHASES_PAR_FAMILLE`),
 * jamais une séquence fixe commune aux 7 familles (structurellement disjointes, voir en-tête de
 * `typesEquationsExpLog.ts`). */
export function calculerSegmentsProgressionEquationsExpLog(etat: EtatSessionEquationsExpLog) {
  const sequence = PHASES_PAR_FAMILLE[etat.exerciceCourant.famille];
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
