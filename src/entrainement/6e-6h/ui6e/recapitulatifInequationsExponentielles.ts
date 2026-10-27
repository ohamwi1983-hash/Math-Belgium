import type { ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import type { EtatSessionInequationExponentielle, PhaseInequationExponentielle } from "../moteur6e/typesInequationsExponentielles";
import { LIBELLE_PHASE_INEQ, contenuRecapPhase } from "./formatInequationsExponentielles";
import { phaseApres, phaseInitiale } from "../moteur6e/typesInequationsExponentielles";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * `formatInequationsExponentielles.ts` n'exporte PAS `formatReponseAttenduePhaseLatex` (vérifié par
 * lecture directe) : la fonction "réponse attendue" existante — déjà utilisée par
 * `App6gen10.tsx` pour `validation.reponseAttendue` — est `contenuRecapPhase` (`{texte, latex}`),
 * jamais `etatActuel` (qui accumule PLUSIEURS écrans déjà confirmés dans un même bloc, impropre à
 * une ligne de récapitulatif unitaire). Libellé via `LIBELLE_PHASE_INEQ` (nom différent de
 * `LIBELLE_PHASE`, déjà exporté sous ce nom exact).
 */
function sequencePourExercice(exercice: ExerciceInequationExponentielle): PhaseInequationExponentielle[] {
  const phases: PhaseInequationExponentielle[] = [];
  let phase: PhaseInequationExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export function calculerRecapitulatifInequationsExponentielles(etat: EtatSessionInequationExponentielle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequencePourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const contenu = contenuRecapPhase(exercice, phase);
    const estLatex = contenu.latex !== null;
    const valeur = estLatex ? (contenu.latex as string) : contenu.texte ?? "";
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE_INEQ[phase], estLatex, valeur, revele };
  });
}

export function calculerSegmentsProgressionInequationsExponentielles(etat: EtatSessionInequationExponentielle) {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
