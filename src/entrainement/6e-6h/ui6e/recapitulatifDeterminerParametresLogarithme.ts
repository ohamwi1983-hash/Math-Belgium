import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme } from "../moteur6e/typesDeterminerParametresLogarithme";
import { SEQUENCE_PHASES } from "../moteur6e/typesDeterminerParametresLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatDeterminerParametresLogarithme";

/**
 * Récapitulatif « Ce qu'on sait déjà » pour `6gen18` — la valeur CONFIRMÉE de chaque écran déjà clos
 * (même contenu que la réponse attendue, `formatReponseAttenduePhaseLatex`), `revele` lu dans
 * `revelesPartiels` (jamais déduit du score).
 */
export function calculerRecapitulatifDeterminerParametresLogarithme(etat: EtatSessionDeterminerParametresLogarithme): EntreeRecapitulatif[] {
  const precedentes = SEQUENCE_PHASES.slice(0, SEQUENCE_PHASES.indexOf(etat.phase));
  return precedentes.map((phase: PhaseDeterminerParametresLogarithme) => {
    const valeurs = formatReponseAttenduePhaseLatex(etat.exerciceCourant, phase);
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele: etat.revelesPartiels[phase] ?? false };
  });
}

export function calculerSegmentsProgressionDeterminerParametresLogarithme(etat: EtatSessionDeterminerParametresLogarithme) {
  return SEQUENCE_PHASES.map((phase) => {
    if (phase === etat.phase && !etat.terminee) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return (etat.aidesPartielles[phase] ?? 0) > 0 ? ("aide" as const) : ("correcte" as const);
  });
}
