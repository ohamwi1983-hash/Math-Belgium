import type { EtatSessionIdentificationConiques, PhaseIdentificationConiques } from "../moteur6e/typesIdentificationConiques";
import { phasesPourExercice } from "../moteur6e/typesIdentificationConiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatIdentificationConiques";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatIdentificationConiques.ts`/`typesIdentificationConiques.ts` — jamais une logique recalculée
 * séparément. `phasesPourExercice` parcourt la chaîne `phaseInitiale → phaseApres` pour CET exercice
 * précis (longueur variable selon la famille/sous-type et le caractère dégénéré ou non de la
 * conique, voir en-tête de `typesIdentificationConiques.ts`).
 */
export function calculerRecapitulatifIdentificationConiques(etat: EtatSessionIdentificationConiques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseIdentificationConiques) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/sous-types. */
export function calculerSegmentsProgressionIdentificationConiques(etat: EtatSessionIdentificationConiques) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
