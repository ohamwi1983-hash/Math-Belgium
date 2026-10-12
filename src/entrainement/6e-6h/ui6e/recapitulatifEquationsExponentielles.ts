import type { ExerciceEquationExponentielle } from "../core6e/equationsExponentielles.types";
import type { EtatSessionEquationExponentielle, PhaseEquationExponentielle } from "../moteur6e/typesEquationsExponentielles";
import { phaseApres, phaseInitiale } from "../moteur6e/typesEquationsExponentielles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex } from "./formatEquationsExponentielles";

/**
 * `formatEquationsExponentielles.ts` n'exporte PAS de `LIBELLE_PHASE` (vérifié par lecture directe
 * — seul générateur du lot sans cette table) : libellés courts construits localement ici, jamais
 * réexportés ailleurs. `formatReponseAttenduePhaseLatex` existe en revanche sous ce nom exact.
 */
const LIBELLE_PHASE: Record<PhaseEquationExponentielle, string> = {
  aEcran1: "Écran 1 (mise en exposant)",
  aEcran2: "Écran 2 (résolution)",
  bEcran1: "Écran 1 (simplification)",
  bEcran2: "Écran 2 (résolution)",
  cEcran1: "Écran 1 (changement de variable)",
  cEcran2: "Écran 2 (résolution en t)",
  cEcran3: "Écran 3 (retour à x)",
  dEcran: "Existence d'une solution",
};

/** `typesEquationsExponentielles.ts` n'exporte pas de table `PHASES_PAR_FAMILLE` : reconstitue la
 * séquence réellement traversée par CET exercice en bouclant `phaseInitiale`/`phaseApres` jusqu'à
 * "termine" — même technique que `App5gen10.tsx` (5e-4h). */
function sequencePourExercice(exercice: ExerciceEquationExponentielle): PhaseEquationExponentielle[] {
  const phases: PhaseEquationExponentielle[] = [];
  let phase: PhaseEquationExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export function calculerRecapitulatifEquationsExponentielles(etat: EtatSessionEquationExponentielle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequencePourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

export function calculerSegmentsProgressionEquationsExponentielles(etat: EtatSessionEquationExponentielle) {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.scoresPartiels[phase] === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
