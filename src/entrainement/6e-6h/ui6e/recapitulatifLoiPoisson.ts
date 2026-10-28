import type { EtatSessionLoiPoisson, PhaseLoiPoisson } from "../moteur6e/typesLoiPoisson";
import { phasesPourExercice } from "../moteur6e/typesLoiPoisson";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatLoiPoisson";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatex` déjà exportés par `formatLoiPoisson.ts`, et
 * `phasesPourExercice` déjà exporté par `typesLoiPoisson.ts` (séquence réelle de CET exercice, qui
 * dépend de la famille ET, pour la famille B, de la stratégie tirée) — jamais une logique
 * recalculée séparément. Mirroir `recapitulatifEquationsExpLog.ts` (6gen14).
 *
 * `revele` vient de `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture de chaque écran — jusqu'au 2025-10, déduit de `scoresPartiels[phase] === 0`,
 * heuristique non fiable ici : l'ancienne pénalité d'aide (supprimée), soustraite APRÈS le score de tentatives,
 * pouvait amener une RÉUSSITE fortement aidée à exactement 0 (faux "révélé") — corrigé pendant le
 * balayage générique (point A).
 */
export function calculerRecapitulatifLoiPoisson(etat: EtatSessionLoiPoisson): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseLoiPoisson) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/stratégies. */
export function calculerSegmentsProgressionLoiPoisson(etat: EtatSessionLoiPoisson) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
