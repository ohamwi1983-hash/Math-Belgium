import type { EtatSessionMethodeGeneratrices, PhaseMethodeGeneratrices } from "../moteur6e/typesMethodeGeneratrices";
import { phasesPourExercice } from "../moteur6e/typesMethodeGeneratrices";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatMethodeGeneratrices";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatMethodeGeneratrices.ts`/`typesMethodeGeneratrices.ts` — jamais une logique recalculée
 * séparément. Les 5 écrans de ce générateur sont FIXES (mêmes pour les 5 familles, voir en-tête de
 * `typesMethodeGeneratrices.ts`), donc `phasesPourExercice` renvoie toujours la même séquence.
 *
 * `revele` vient de `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture de chaque écran — jusqu'au 2025-10, déduit de `scoresPartiels[phase] === 0`,
 * heuristique non fiable ici : la pénalité d'aide, soustraite APRÈS le score de tentatives,
 * pouvait amener une RÉUSSITE fortement aidée à exactement 0 (faux "révélé") — corrigé pendant le
 * balayage générique (point A).
 */
export function calculerRecapitulatifMethodeGeneratrices(etat: EtatSessionMethodeGeneratrices): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseMethodeGeneratrices) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran de la séquence FIXE (`phasesPourExercice`) — toujours les 5 mêmes écrans quelle
 * que soit la famille de l'exercice courant. */
export function calculerSegmentsProgressionMethodeGeneratrices(etat: EtatSessionMethodeGeneratrices) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.revelesPartiels[phase]) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
