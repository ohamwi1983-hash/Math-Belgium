import type { EtatSessionTangentesConique, PhaseTangentesConique } from "../moteur6e/typesTangentesConique";
import { phasesPourExercice } from "../moteur6e/typesTangentesConique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatTangentesConique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatTangentesConique.ts`/`typesTangentesConique.ts` — jamais une logique recalculée séparément.
 * `phasesPourExercice` parcourt la chaîne `phaseInitiale → phaseApres` pour CET exercice précis
 * (écran final sauté pour les familles B/C quand `!aSolution`, voir en-tête de
 * `typesTangentesConique.ts`).
 */
export function calculerRecapitulatifTangentesConique(etat: EtatSessionTangentesConique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseTangentesConique) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 5 familles. */
export function calculerSegmentsProgressionTangentesConique(etat: EtatSessionTangentesConique) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
