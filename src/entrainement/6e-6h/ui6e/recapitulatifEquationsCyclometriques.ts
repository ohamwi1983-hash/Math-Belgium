import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import { PHASE_INITIALE, phaseApres } from "../moteur6e/typesEquationsCyclometriques";
import type { EtatSessionEquationsCyclometriques, PhaseEquationsCyclometriques } from "../moteur6e/typesEquationsCyclometriques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
import { MAX_DEN, formatCandidatLatex, formatEquationNonCycloLatex } from "./formatEquationsCyclometriques";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen3`. Séquence réellement traversée reconstruite en
 * bouclant `PHASE_INITIALE`/`phaseApres(phase, exercice)` jusqu'à `"termine"` (jamais une séquence
 * supposée) — voir l'en-tête de `typesEquationsCyclometriques.ts` : l'écran "condition" n'existe
 * que pour la variante `arcfonctionsDifferentes`, l'écran "acceptRejet" est sauté si 0 candidat.
 *
 * `revele` par phase close déduit de `scoresPartiels[phase] === 0` — convention déjà établie par
 * `recapitulatifEquationsExpLog.ts` (6gen14) : `soumettreEtapeTentatives` (`moteur/etapeTentatives.ts`)
 * force le score à EXACTEMENT 0 ssi la réponse a été révélée (tentatives épuisées), jamais en cas de
 * réussite (`pointsDeBase` plein, toujours >0, même sans pénalité). Aucun champ "revele" par phase
 * n'existe côté `scoresPartiels` lui-même (seul `derniereCloture` porte celui de l'écran qui VIENT
 * de se fermer) — cette déduction est donc la seule source fiable pour une phase déjà ancienne.
 */

const LIBELLE_PHASE: Record<PhaseEquationsCyclometriques, string> = {
  ce: "Condition d'existence (CE)",
  condition: "Condition de compatibilité",
  equation: "Équation non cyclométrique",
  solutions: "Solutions (avant la CE)",
  acceptRejet: "Accepter / rejeter",
};

function sequenceReelle(exercice: ExerciceEquationsCyclometriques): PhaseEquationsCyclometriques[] {
  const sequence: PhaseEquationsCyclometriques[] = [];
  let phase: PhaseEquationsCyclometriques | "termine" = PHASE_INITIALE;
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return sequence;
}

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

/** Liste de candidats au format `x = ...` déjà utilisé par `ListeSolutions`/`formatCandidatLatex`
 * (`App6gen3.tsx`), regroupés en UNE SEULE expression LaTeX (virgule comme séparateur, comme
 * affiché à l'écran) — "Aucune solution" (texte brut, pas de LaTeX) si la liste est vide. */
function valeurListeCandidats(candidats: number[]): FragmentsRecap {
  if (candidats.length === 0) return { valeur: "Aucune solution", estLatex: false };
  return { valeur: candidats.map((x) => formatCandidatLatex(x)).join(",\\ "), estLatex: true };
}

function valeurPourPhase(exercice: ExerciceEquationsCyclometriques, phase: PhaseEquationsCyclometriques): FragmentsRecap {
  switch (phase) {
    case "ce":
      return { valeur: formatEnsembleReelLatex(exercice.ce, MAX_DEN), estLatex: true };
    case "condition":
      // N'apparaît que pour la variante `arcfonctionsDifferentes` (voir `phaseApres`).
      return { valeur: formatEnsembleReelLatex((exercice as Extract<ExerciceEquationsCyclometriques, { variante: "arcfonctionsDifferentes" }>).conditionParasite, MAX_DEN), estLatex: true };
    case "equation":
      return { valeur: formatEquationNonCycloLatex(exercice), estLatex: true };
    case "solutions":
      return valeurListeCandidats(exercice.candidats.map((c) => c.x));
    case "acceptRejet":
      return valeurListeCandidats(exercice.candidats.filter((c) => c.accepteAttendu).map((c) => c.x));
  }
}

export function calculerRecapitulatifEquationsCyclometriques(etat: EtatSessionEquationsCyclometriques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceReelle(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.scoresPartiels[phase] === 0;
    return { libelle: LIBELLE_PHASE[phase], revele, ...valeurPourPhase(exercice, phase) };
  });
}

/** Une puce par écran RÉELLEMENT traversé par l'exercice courant (`sequenceReelle`), jamais une
 * séquence fixe commune aux 4 variantes. */
export function calculerSegmentsProgressionEquationsCyclometriques(etat: EtatSessionEquationsCyclometriques) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir" as const;
    return score === 0 ? ("revele" as const) : ("correcte" as const);
  });
}
