import type { EtatSessionAireExcentriciteConique, PhaseAireExcentriciteConique } from "../moteur6e/typesAireExcentriciteConique";
import { phasesPourExercice } from "../moteur6e/typesAireExcentriciteConique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatAireExcentriciteConique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatAireExcentriciteConique.ts`/`typesAireExcentriciteConique.ts` — jamais une logique
 * recalculée séparément. `phasesPourExercice` dépend ici UNIQUEMENT de la famille de l'exercice
 * (3 écrans pour A, 2 pour B, voir en-tête de `typesAireExcentriciteConique.ts`).
 */
export function calculerRecapitulatifAireExcentriciteConique(etat: EtatSessionAireExcentriciteConique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseAireExcentriciteConique) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 2 familles. */
export function calculerSegmentsProgressionAireExcentriciteConique(etat: EtatSessionAireExcentriciteConique) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
