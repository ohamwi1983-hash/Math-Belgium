import type { EtatSessionRacinesNiemes, PhaseRacinesNiemes } from "../moteur6e/typesRacinesNiemes";
import { phasesPourExercice } from "../moteur6e/typesRacinesNiemes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatRacinesNiemes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatRacinesNiemes.ts`/`typesRacinesNiemes.ts` — jamais une logique recalculée séparément.
 */
export function calculerRecapitulatifRacinesNiemes(etat: EtatSessionRacinesNiemes): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseRacinesNiemes) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 3 familles. */
export function calculerSegmentsProgressionRacinesNiemes(etat: EtatSessionRacinesNiemes) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
