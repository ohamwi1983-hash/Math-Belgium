import type { EtatSessionIntersectionsConiques, PhaseIntersectionsConiques } from "../moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "../moteur6e/typesIntersectionsConiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatIntersectionsConiques";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatIntersectionsConiques.ts`/`typesIntersectionsConiques.ts` — jamais une logique recalculée
 * séparément. `phasesPourExercice` parcourt la chaîne `phaseInitiale → phaseApres` pour CET exercice
 * précis (écran 1 sauté pour la famille A quand `coniqueDirecte`, voir en-tête de
 * `typesIntersectionsConiques.ts`).
 */
export function calculerRecapitulatifIntersectionsConiques(etat: EtatSessionIntersectionsConiques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseIntersectionsConiques) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 2 familles. */
export function calculerSegmentsProgressionIntersectionsConiques(etat: EtatSessionIntersectionsConiques) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
