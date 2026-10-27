import type { EtatSessionEtudeFonctionExponentielle, PhaseEtudeFonctionExponentielle } from "../moteur6e/typesEtudeFonctionExponentielle";
import { phaseApres, phaseInitiale } from "../moteur6e/typesEtudeFonctionExponentielle";
import { LIBELLE_PHASE_ETUDE, contenuRecapPhase } from "./formatEtudeFonctionExponentielle";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * `formatEtudeFonctionExponentielle.ts` n'exporte PAS `formatReponseAttenduePhaseLatex` : la
 * fonction "réponse attendue" déjà utilisée par `App6gen11.tsx` pour `validation.reponseAttendue`
 * est `contenuRecapPhase` (`{texte, latex}` pour UNE SEULE phase) — jamais `etatActuel`, qui
 * accumule plusieurs lignes "label : valeur" déjà fusionnées en un seul bloc LaTeX (incompatible
 * avec la structure `{libelle, valeur}` d'`EntreeRecapitulatif`). Libellé via `LIBELLE_PHASE_ETUDE`
 * (déjà exporté sous ce nom exact). Séquence FIXE à 6 écrans (`typesEtudeFonctionExponentielle.ts`,
 * "chaque instance suit les 6 mêmes tâches, dans l'ordre") — reconstituée via `phaseInitiale`/
 * `phaseApres` comme les autres générateurs à séquence variable, pour rester robuste à toute
 * évolution future de `ORDRE` (non exporté).
 */
function sequenceComplete(): PhaseEtudeFonctionExponentielle[] {
  const phases: PhaseEtudeFonctionExponentielle[] = [];
  let phase: PhaseEtudeFonctionExponentielle | "termine" = phaseInitiale();
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export function calculerRecapitulatifEtudeFonctionExponentielle(etat: EtatSessionEtudeFonctionExponentielle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceComplete();
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const contenu = contenuRecapPhase(exercice, phase);
    const estLatex = contenu.latex !== null;
    const valeur = estLatex ? (contenu.latex as string) : contenu.texte ?? "";
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE_ETUDE[phase], estLatex, valeur, revele };
  });
}

export function calculerSegmentsProgressionEtudeFonctionExponentielle(etat: EtatSessionEtudeFonctionExponentielle) {
  const sequence = sequenceComplete();
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
