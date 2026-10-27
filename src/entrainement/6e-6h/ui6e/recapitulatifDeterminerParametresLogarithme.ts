import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme } from "../moteur6e/typesDeterminerParametresLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, PHASES_PAR_FAMILLE, formatReponseAttenduePhaseLatex } from "./formatDeterminerParametresLogarithme";

/**
 * `6gen18` — `LIBELLE_PHASE`/`PHASES_PAR_FAMILLE`/`formatReponseAttenduePhaseLatex` existent tous
 * sous ces noms exacts standards (vérifié par lecture directe) — `formatReponseAttenduePhaseLatex`
 * délègue à 3 sous-fonctions par famille (`formatReponseAttendueA/B/C`) mais la fonction finale
 * encapsule déjà tout le dispatch, utilisée telle quelle ici, mirroir exact
 * `recapitulatifEquationsExpLog.ts`.
 */
export function calculerRecapitulatifDeterminerParametresLogarithme(etat: EtatSessionDeterminerParametresLogarithme): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = PHASES_PAR_FAMILLE[exercice.famille];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseDeterminerParametresLogarithme) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

export function calculerSegmentsProgressionDeterminerParametresLogarithme(etat: EtatSessionDeterminerParametresLogarithme) {
  const sequence = PHASES_PAR_FAMILLE[etat.exerciceCourant.famille];
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
