import type { EtatSessionProbabiliteHypergeometrique, PhaseProbabiliteHypergeometrique } from "../moteur6e/typesProbabiliteHypergeometrique";
import { phasesPourExercice } from "../moteur6e/typesProbabiliteHypergeometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatProbabiliteHypergeometrique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatex` déjà exportés par
 * `formatProbabiliteHypergeometrique.ts`, et `phasesPourExercice` déjà exporté par
 * `typesProbabiliteHypergeometrique.ts` (séquence réelle de CET exercice, longueur variable selon
 * la famille) — jamais une logique recalculée séparément. Mirroir
 * `recapitulatifEquationsExpLog.ts` (6gen14).
 *
 * `revele` vient de `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture de chaque écran — jusqu'au 2025-10, déduit de `scoresPartiels[phase] === 0`,
 * heuristique non fiable ici : l'ancienne pénalité d'aide (supprimée), soustraite APRÈS le score de tentatives,
 * pouvait amener une RÉUSSITE fortement aidée à exactement 0 (faux "révélé") — corrigé pendant le
 * balayage générique (point A).
 */
export function calculerRecapitulatifProbabiliteHypergeometrique(etat: EtatSessionProbabiliteHypergeometrique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseProbabiliteHypergeometrique) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles. */
export function calculerSegmentsProgressionProbabiliteHypergeometrique(etat: EtatSessionProbabiliteHypergeometrique) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
