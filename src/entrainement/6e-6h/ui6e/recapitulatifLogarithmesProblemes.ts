import type { EtatSessionLogarithmesProblemes, PhaseLogarithmesProblemes } from "../moteur6e/typesLogarithmesProblemes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex, phasesPourExercice } from "./formatLogarithmesProblemes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatLogarithmesProblemes.ts` — jamais une logique recalculée séparément (même patron que
 * `recapitulatifEquationsExpLog.ts`, 6gen14). `phasesPourExercice` (pas `PHASES_PAR_FAMILLE`) ici :
 * la famille E a un nombre d'écrans variable PAR INSTANCE (`eEcran1` absent quand
 * `deduireAB===false`), voir l'en-tête de `formatLogarithmesProblemes.ts`.
 *
 * `revele` vient de `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture de chaque écran — jusqu'au 2025-10, déduit de `scoresPartiels[phase] === 0`,
 * heuristique non fiable ici : l'ancienne pénalité d'aide (supprimée), soustraite APRÈS le score de tentatives,
 * pouvait amener une RÉUSSITE fortement aidée à exactement 0 (faux "révélé") — corrigé pendant le
 * balayage générique (point A).
 */
export function calculerRecapitulatifLogarithmesProblemes(etat: EtatSessionLogarithmesProblemes): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseLogarithmesProblemes) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice précis (`phasesPourExercice`), jamais
 * une table par famille (variable par instance pour la famille E). */
export function calculerSegmentsProgressionLogarithmesProblemes(etat: EtatSessionLogarithmesProblemes) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
