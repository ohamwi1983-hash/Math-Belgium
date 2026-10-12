import type { EtatSessionLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../moteur6e/typesLieuxGeometriquesParametres";
import { phasesPourExercice } from "../moteur6e/typesLieuxGeometriquesParametres";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatLieuxGeometriquesParametres";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours pour `6gen56`. Réutilise
 * `libellePhase`/`formatReponseAttenduePhaseLatex` (déjà exportés par
 * `formatLieuxGeometriquesParametres.ts`) et `phasesPourExercice` (`typesLieuxGeometriquesParametres.ts`)
 * pour reconstituer la séquence RÉELLEMENT traversée par CET exercice précis (longueur de chaîne
 * variable selon famille/sous-type/régime — jamais une table `PHASES_PAR_FAMILLE` fixe, voir
 * l'en-tête de `typesLieuxGeometriquesParametres.ts`), mirroir `recapitulatifEquationsExpLog.ts`.
 */
export function calculerRecapitulatifLieuxGeometriquesParametres(etat: EtatSessionLieuxGeometriquesParametres): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseLieuxGeometriquesParametres) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: libellePhase(phase), estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice (`phasesPourExercice`), jamais une
 * séquence fixe commune à toutes les familles/sous-types. */
export function calculerSegmentsProgressionLieuxGeometriquesParametres(etat: EtatSessionLieuxGeometriquesParametres) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
