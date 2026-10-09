import type { ExerciceIdentificationConiques, NatureConique } from "../core6e/identificationConiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen58`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille/sous-type ET selon le CARACTÈRE dégénéré ou non de l'exercice tiré (un écran final
 * "éléments caractéristiques" n'a de sens que si la conique n'est pas dégénérée) — `phaseApres`
 * prend donc un 2e paramètre `exercice`, même patron que `typesCalculAires.ts` (6gen26, famille D)
 * et `typesIntegralesProblemes.ts` (6gen29).
 *
 * - A sous-type `centree2Carres` : a1Ecran1 → a1Ecran2 → [a1Ecran3 si non dégénérée].
 * - A sous-type `unCarreUnLineaire` : a2Ecran1 → a2Ecran2 → [a2Ecran3 si parabole].
 * - B : bEcran1 → bEcran2 → bEcran3 → [bEcran4 si non dégénérée].
 * - C : cEcran1 → cEcran2 → cEcran3 → cEcran4 (TOUJOURS les 4 — la famille C ne produit jamais une
 *   conique dégénérée, voir `generateurs6e/identificationConiques/familleC.ts`).
 */

export type PhaseIdentificationConiques = "a1Ecran1" | "a1Ecran2" | "a1Ecran3" | "a2Ecran1" | "a2Ecran2" | "a2Ecran3" | "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4" | "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4";

/** Vrai pour les 3 natures NON dégénérées (cercle/ellipse/hyperbole) — les seules pour lesquelles un
 * écran "éléments caractéristiques" a un sens (∅/point/2 droites n'ont pas de sommets/foyers). */
export function estNonDegeneree(nature: NatureConique): boolean {
  return nature.type === "cercle" || nature.type === "ellipse" || nature.type === "hyperbole";
}

export function phaseInitiale(exercice: ExerciceIdentificationConiques): PhaseIdentificationConiques {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "centree2Carres" ? "a1Ecran1" : "a2Ecran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
  }
}

export function phaseApres(phase: PhaseIdentificationConiques, exercice: ExerciceIdentificationConiques): PhaseIdentificationConiques | "termine" {
  switch (phase) {
    case "a1Ecran1":
      return "a1Ecran2";
    case "a1Ecran2":
      return exercice.famille === "A" && exercice.sousType === "centree2Carres" && estNonDegeneree(exercice.nature) ? "a1Ecran3" : "termine";
    case "a1Ecran3":
      return "termine";
    case "a2Ecran1":
      return "a2Ecran2";
    case "a2Ecran2":
      return exercice.famille === "A" && exercice.sousType === "unCarreUnLineaire" && exercice.nature.type === "parabole" ? "a2Ecran3" : "termine";
    case "a2Ecran3":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "bEcran3";
    case "bEcran3":
      return exercice.famille === "B" && estNonDegeneree(exercice.nature) ? "bEcran4" : "termine";
    case "bEcran4":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "cEcran4";
    case "cEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — parcourt la chaîne
 * `phaseInitiale → phaseApres`, jamais une table statique (mirroir 6gen26/6gen29). */
export function phasesPourExercice(exercice: ExerciceIdentificationConiques): PhaseIdentificationConiques[] {
  const phases: PhaseIdentificationConiques[] = [];
  let phase: PhaseIdentificationConiques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

export interface ResultatExerciceIdentificationConiques {
  exercice: ExerciceIdentificationConiques;
  scores: Partial<Record<PhaseIdentificationConiques, number>>;
}

export interface EtatSessionIdentificationConiques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIdentificationConiques;
  exerciceCourant: ExerciceIdentificationConiques;
  phase: PhaseIdentificationConiques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseIdentificationConiques, number>>;
  indexExercice: number;
  resultats: ResultatExerciceIdentificationConiques[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md. */
  derniereTransitionRevelee: boolean;
}
