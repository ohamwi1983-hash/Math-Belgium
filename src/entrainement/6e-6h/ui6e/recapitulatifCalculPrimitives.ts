import type { EtatSessionCalculPrimitives, PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice } from "../moteur6e/typesCalculPrimitives";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatCalculPrimitives";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`formatReponseAttenduePhaseLatex` de `formatCalculPrimitives.ts` et
 * `phasesPourExercice` de `moteur6e/typesCalculPrimitives.ts` (PAS de table statique
 * `PHASES_PAR_FAMILLE` pour ce générateur — voir l'en-tête de ce fichier) — jamais une logique
 * recalculée séparément (même patron que `recapitulatifEquationsExpLog.ts`, 6gen14).
 */
export function calculerRecapitulatifCalculPrimitives(etat: EtatSessionCalculPrimitives): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseCalculPrimitives) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice précis (`phasesPourExercice`). */
export function calculerSegmentsProgressionCalculPrimitives(etat: EtatSessionCalculPrimitives) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    if (etat.scoresPartiels[phase] === 0) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
