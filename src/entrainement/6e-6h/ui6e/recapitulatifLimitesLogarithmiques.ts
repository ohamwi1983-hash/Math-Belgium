import type { ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesLimitesLogarithmiques";
import type { EtatSessionLimiteLogarithmique, PhaseLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatCategorieLabel, formatCibleTexte, formatReformulationBLatex } from "./formatLimitesLogarithmiques";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen17`. Reprend EXACTEMENT, phase par phase, le contenu
 * de `reponseAttenduePhase` (`App6gen17.tsx`, lui-même aligné sur l'ancien
 * `ResultatPanelLimitesLogarithmiques.tsx`) — jamais une cible recalculée séparément. Couvre les 6
 * phases (familles A à C).
 *
 * `revele` déduit de `detailsPartiels[phase].revele` — jamais `scoresPartiels[phase] === 0`, non
 * fiable ici (voir le commentaire de `DetailPhaseLimiteLogarithmique`,
 * `typesLimitesLogarithmiques.ts` : même piège que `6gen7`/`6gen16`, une pénalité d'aide (supprimée depuis) pouvait à elle seule ramener le score à 0 sans révélation).
 */

const LIBELLE_PHASE: Record<PhaseLimiteLogarithmique, string> = {
  aDominance: "Dominance (num./dénom.)",
  aConclure: "Limite",
  bReformuler: "Forme reformulée",
  bConclure: "Limite",
  cDiagnostic: "Diagnostic (num./dénom.)",
  cConclure: "Limite",
};

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

/** Exporté pour `App6gen17.tsx` (réponse attendue, fiche de consultation) — même contenu partout. */
export function valeurPourPhase(exercice: ExerciceLimiteLogarithmique, phase: PhaseLimiteLogarithmique): FragmentsRecap {
  if (exercice.famille === "A") {
    if (phase === "aDominance") {
      return { valeur: `Numérateur : ${formatCategorieLabel(exercice.dominanceNumerateur)} — Dénominateur : ${formatCategorieLabel(exercice.dominanceDenominateur)}`, estLatex: false };
    }
    return { valeur: formatCibleTexte(exercice.limiteGlobale), estLatex: true };
  }
  if (exercice.famille === "B") {
    if (phase === "bReformuler") return { valeur: `f = ${formatReformulationBLatex(exercice)}`, estLatex: true };
    return { valeur: exercice.limiteLatex, estLatex: true };
  }
  if (phase === "cDiagnostic") {
    const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
    return { valeur: `\\text{partie 1} \\to ${formatCibleTexte(cible1)},\\quad \\text{partie 2} \\to ${formatCibleTexte(cible2)}`, estLatex: true };
  }
  return { valeur: formatCibleTexte(exercice.limiteFinale), estLatex: true };
}

function sequenceReelle(exercice: ExerciceLimiteLogarithmique): PhaseLimiteLogarithmique[] {
  const sequence: PhaseLimiteLogarithmique[] = [];
  let phase: PhaseLimiteLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifLimiteLogarithmique(etat: EtatSessionLimiteLogarithmique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceReelle(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE[phase], revele, ...valeurPourPhase(exercice, phase) };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`). */
export function calculerSegmentsProgressionLimiteLogarithmique(etat: EtatSessionLimiteLogarithmique) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
