import type { ExerciceInequationLogarithmique } from "../core6e/inequationsLogarithmiques.types";
import type { EtatSessionInequationLogarithmique, PhaseInequationLogarithmique } from "../moteur6e/typesInequationsLogarithmiques";
import { phaseApres, phaseInitiale } from "../moteur6e/typesInequationsLogarithmiques";
import { LIBELLE_PHASE_LOG, contenuRecapPhase } from "./formatInequationsLogarithmiques";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * `formatInequationsLogarithmiques.ts` n'exporte PAS `formatReponseAttenduePhaseLatex` : la
 * fonction "réponse attendue" déjà utilisée par `App6gen15.tsx` pour `validation.reponseAttendue`
 * est `contenuRecapPhase(exercice, phase)` (`{texte, latex}`), jamais `etatActuel` (signature
 * `(phase, exercice)`, ordre INVERSÉ par rapport à `contenuRecapPhase` — vérifié par lecture
 * directe). Libellé via `LIBELLE_PHASE_LOG` (nom différent de `LIBELLE_PHASE`, déjà exporté sous ce
 * nom exact).
 */
function sequencePourExercice(exercice: ExerciceInequationLogarithmique): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase: PhaseInequationLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export function calculerRecapitulatifInequationsLogarithmiques(etat: EtatSessionInequationLogarithmique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequencePourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const contenu = contenuRecapPhase(exercice, phase);
    const estLatex = contenu.latex !== null;
    const valeur = estLatex ? (contenu.latex as string) : contenu.texte ?? "";
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE_LOG[phase], estLatex, valeur, revele };
  });
}

export function calculerSegmentsProgressionInequationsLogarithmiques(etat: EtatSessionInequationLogarithmique) {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
