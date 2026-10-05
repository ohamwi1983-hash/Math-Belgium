/**
 * Couche B (5e) — types pour 5gen13 ("Modéliser une fonction sinusoïdale en contexte"). Phase 1 (4
 * techniques disjointes, 0 à 5 écrans) PUIS Phase 2 (optionnelle, 3 types disjoints, 0 à 4 écrans) —
 * `ordreComplet(exercice)` construit la séquence COMPLÈTE (Phase 1 puis Phase 2) en une seule table,
 * `phaseInitiale`/`phaseApres` n'en sont que de simples indexations, jamais un `switch` dupliqué.
 *
 * `ResultatExerciceModelisationSinusoide.scores: Partial<Record<PhaseModelisationSinusoide,number>>`
 * — le SET de phases réellement traversées varie trop largement (4 techniques × 3 types × sauts
 * conditionnels) pour qu'un type à champs fixes par combinaison soit praticable ; même principe que
 * `EtatSessionParametresSinusoideGraphique`... non, plus proche de `scoresPartiels` déjà utilisé par
 * 5gen6/5gen12 — généralisé ici à l'exercice ENTIER (pas seulement l'état de session en cours).
 */
import type { DonneesPhase1, ExerciceModelisationSinusoide, QuestionPhase2 } from "../core5e/modelisationSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseModelisationSinusoide =
  // Phase 1 — B1/B2 (écrans PARTAGÉS entre les 2 techniques : "amplitude"/"decalage"/"pulsation",
  // voir `prompt5gen13B1B2B3.md" — B1 calcule directement ω=2π/dureeTour, jamais via une étape
  // intermédiaire en degrés/seconde, écran alors supprimé).
  | "amplitude"
  | "decalage"
  | "pulsation"
  // Phase 1 — B2 uniquement
  | "phi"
  // Phase 1 — B3
  | "systeme"
  | "resolution"
  // Phase 1 — commune à B1/B2/B3 (terminale de la Phase 1)
  | "fonctionFinale"
  // Phase 2 — Type "resoudre"
  | "argumentResoudre"
  | "isolerTResoudre"
  | "solutionsResoudre"
  // Phase 2 — Type "extremum"
  | "poserExtremum"
  | "isolerTExtremum"
  | "solutionsExtremum"
  // Phase 2 — Type "inequation"
  | "isolerSinInequation"
  | "resoudreUInequation"
  | "isolerTInequation"
  | "listerIntervallesInequation";

function ordrePhase1(donnees: DonneesPhase1): PhaseModelisationSinusoide[] {
  switch (donnees.technique) {
    case "b1":
      return ["amplitude", "decalage", "pulsation", "fonctionFinale"];
    case "b2":
      return ["amplitude", "decalage", "pulsation", "phi", "fonctionFinale"];
    case "b3":
      return ["systeme", "resolution", "fonctionFinale"];
    case "donnee":
      return [];
  }
}

function ordrePhase2(question: QuestionPhase2 | null): PhaseModelisationSinusoide[] {
  if (question === null) return [];
  switch (question.type) {
    case "resoudre":
      return question.aucuneSolution ? ["argumentResoudre"] : ["argumentResoudre", "isolerTResoudre", "solutionsResoudre"];
    case "extremum":
      return ["poserExtremum", "isolerTExtremum", "solutionsExtremum"];
    case "inequation":
      return question.casSpecial !== null ? ["isolerSinInequation"] : ["isolerSinInequation", "resoudreUInequation", "isolerTInequation", "listerIntervallesInequation"];
  }
}

/** Séquence COMPLÈTE (Phase 1 puis Phase 2) pour un exercice donné — jamais vide par construction
 * (la Couche A force `phase2` non-null pour la technique "donnee", seule technique à sauter la
 * Phase 1 entièrement — voir `generateurs5e/modelisationSinusoide/index.ts`). */
export function ordreComplet(exercice: ExerciceModelisationSinusoide): PhaseModelisationSinusoide[] {
  return [...ordrePhase1(exercice.phase1), ...ordrePhase2(exercice.phase2)];
}

export function phaseInitiale(exercice: ExerciceModelisationSinusoide): PhaseModelisationSinusoide {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): PhaseModelisationSinusoide | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceModelisationSinusoide {
  exercice: ExerciceModelisationSinusoide;
  scores: Partial<Record<PhaseModelisationSinusoide, number>>;
}

export interface EtatSessionModelisationSinusoide {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceModelisationSinusoide;
  exerciceCourant: ExerciceModelisationSinusoide;
  phase: PhaseModelisationSinusoide;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que le reste du chantier 5e). */
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseModelisationSinusoide, number>>;
  indexExercice: number;
  resultats: ResultatExerciceModelisationSinusoide[];
  terminee: boolean;
  /** Capture POST-soumission de `etapeCourante.revelee` de la dernière phase close (voir A.1,
   * `sessionModelisationSinusoide.ts`) — `etat.etapeCourante.revelee` lu côté UI avant soumission
   * est structurellement toujours `false` (l'écran vient de démarrer), ce qui rendait le récap
   * final systématiquement vert. */
  derniereEtapeRevelee: boolean;
}
