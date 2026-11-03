import { phaseApres, phaseInitiale } from "../moteur6e/typesHyperboliques";
import type { EtatSessionHyperboliques, PhaseHyperboliques } from "../moteur6e/typesHyperboliques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { reponseAttendueLatex } from "./formatHyperboliques";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen19` — la valeur CONFIRMÉE de chaque écran déjà
 * clos, en LaTeX (`reponseAttendueLatex`, la même que la révélation et le corrigé), jamais un
 * texte de confirmation générique.
 *
 * `revele` déduit de `detailsPartiels[phase].revele` — jamais `scoresPartiels[phase] === 0`, non
 * fiable ici (même convention documentée que `6gen7`/`6gen16`/`6gen17`, voir
 * `DetailPhaseHyperboliques`).
 */

export const LIBELLE_PHASE_HYPERBOLIQUES: Record<PhaseHyperboliques, string> = {
  aParite: "Parité",
  bValeurs: "Valeur(s)",
  cDerivee: "f'(x)",
  cDeriveeSeconde: "f''(x)",
  dReecriture: "f(x) réécrite",
  dLimites: "Signes des limites",
};

export function sequenceReelleHyperboliques(exercice: EtatSessionHyperboliques["exerciceCourant"]): PhaseHyperboliques[] {
  const sequence: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifHyperboliques(etat: EtatSessionHyperboliques): EntreeRecapitulatif[] {
  const sequence = sequenceReelleHyperboliques(etat.exerciceCourant);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE_HYPERBOLIQUES[phase], revele, valeur: `\\displaystyle ${reponseAttendueLatex(etat.exerciceCourant, phase)}`, estLatex: true };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`). */
export function calculerSegmentsProgressionHyperboliques(etat: EtatSessionHyperboliques) {
  const sequence = sequenceReelleHyperboliques(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
