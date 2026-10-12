import type { ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesLimitesLogarithmiques";
import type { EtatSessionLimiteLogarithmique, PhaseLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatCategorieLabel, formatCibleTexte } from "./formatLimitesLogarithmiques";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen17`. Reprend EXACTEMENT, phase par phase, le contenu
 * de `reponseAttenduePhase` (`App6gen17.tsx`, lui-même aligné sur l'ancien
 * `ResultatPanelLimitesLogarithmiques.tsx`) — jamais une cible recalculée séparément. Couvre les 12
 * phases (familles A à E, E étant une instance UNIQUE, donc toutes ses valeurs sont fixes).
 *
 * `revele` déduit de `detailsPartiels[phase].revele` — jamais `scoresPartiels[phase] === 0`, non
 * fiable ici (voir le commentaire de `DetailPhaseLimiteLogarithmique`,
 * `typesLimitesLogarithmiques.ts` : même piège que `6gen7`/`6gen16`, une pénalité d'aide peut à
 * elle seule ramener le score à 0 sans révélation).
 */

const LIBELLE_PHASE: Record<PhaseLimiteLogarithmique, string> = {
  aDominance: "Dominance (num./dénom.)",
  aConclure: "Limite",
  bReformuler: "Forme reformulée",
  bConclure: "Limite",
  cDiagnostic: "Diagnostic (num./dénom.)",
  cConclure: "Limite",
  dExposant: "Exposant isolé",
  dLimiteExposant: "Limite de l'exposant",
  dConclure: "Limite",
  eDevelopper: "Numérateur développé",
  eSimplifier: "Forme simplifiée",
  eConclure: "Limite",
};

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

function valeurPourPhase(exercice: ExerciceLimiteLogarithmique, phase: PhaseLimiteLogarithmique): FragmentsRecap {
  if (exercice.famille === "A") {
    if (phase === "aDominance") {
      return { valeur: `Numérateur : ${formatCategorieLabel(exercice.dominanceNumerateur)} — Dénominateur : ${formatCategorieLabel(exercice.dominanceDenominateur)}`, estLatex: false };
    }
    return { valeur: formatCibleTexte(exercice.limiteGlobale), estLatex: true };
  }
  if (exercice.famille === "B") {
    if (phase === "bReformuler") return { valeur: "Forme reformulée en u=x/x0−1, faisant apparaître la limite de référence, équivalente à f(x).", estLatex: false };
    return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "C") {
    if (phase === "cDiagnostic") return { valeur: "Numérateur et dénominateur (ou chaque facteur) évalués séparément, avant toute conclusion.", estLatex: false };
    return { valeur: formatCibleTexte(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "D") {
    if (phase === "dExposant") return { valeur: "f^g réécrit e^(g·ln f), exposant g·ln(f) isolé, équivalent à la forme attendue.", estLatex: false };
    if (phase === "dLimiteExposant") return { valeur: String(exercice.limiteExposant), estLatex: true };
    return { valeur: `e^{${exercice.limiteExposant}}`, estLatex: true };
  }
  // Famille E — instance unique, valeurs fixes.
  if (phase === "eDevelopper") return { valeur: "x^2\\left(\\ln 3+\\frac12\\right)", estLatex: true };
  if (phase === "eSimplifier") return { valeur: "\\frac{\\ln 3+\\frac12}{4}", estLatex: true };
  return { valeur: "\\frac{2\\ln 3+1}{8}", estLatex: true };
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
