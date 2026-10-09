import type { ExerciceNombresComplexes } from "../core6e/nombresComplexes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen34`. 7 familles, longueur de chaîne d'écrans variable
 * (1 pour A/D, 1 ou 2 pour B selon le sous-type, 2 pour C/E/F/G) — mirroir du patron
 * `phaseInitiale`/`phaseApres` de `typesLongueurArc.ts` (6gen28) : contrairement à
 * `typesCalculAires.ts` (6gen26), AUCUNE branche de `phaseApres` ne dépend du sous-type de
 * l'exercice une fois la phase INITIALE déterminée (seule la famille B a un sous-type, et son
 * unique branchement — combien d'écrans — est déjà capturé entièrement par `phaseInitiale` ;
 * `bCubeEcran1 → bCubeEcran2 → termine` est ensuite une chaîne FIXE, comme toutes les autres) —
 * `phaseApres` n'a donc PAS besoin du paramètre `exercice`.
 */

export type PhaseNombresComplexes =
  | "aEcran1"
  | "bProduitEcran1"
  | "bCarreEcran1"
  | "bCubeEcran1"
  | "bCubeEcran2"
  | "cEcran1"
  | "cEcran2"
  | "dEcran1"
  | "eEcran1"
  | "eEcran2"
  | "fEcran1"
  | "fEcran2"
  | "gEcran1"
  | "gEcran2";

export function phaseInitiale(exercice: ExerciceNombresComplexes): PhaseNombresComplexes {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      if (exercice.sousType === "produit") return "bProduitEcran1";
      if (exercice.sousType === "carre") return "bCarreEcran1";
      return "bCubeEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran1";
    case "E":
      return "eEcran1";
    case "F":
      return "fEcran1";
    case "G":
      return "gEcran1";
  }
}

export function phaseApres(phase: PhaseNombresComplexes): PhaseNombresComplexes | "termine" {
  switch (phase) {
    case "aEcran1":
      return "termine";
    case "bProduitEcran1":
      return "termine";
    case "bCarreEcran1":
      return "termine";
    case "bCubeEcran1":
      return "bCubeEcran2";
    case "bCubeEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "termine";
    case "dEcran1":
      return "termine";
    case "eEcran1":
      return "eEcran2";
    case "eEcran2":
      return "termine";
    case "fEcran1":
      return "fEcran2";
    case "fEcran2":
      return "termine";
    case "gEcran1":
      return "gEcran2";
    case "gEcran2":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen28. */
export function phasesPourExercice(exercice: ExerciceNombresComplexes): PhaseNombresComplexes[] {
  const phases: PhaseNombresComplexes[] = [];
  let phase: PhaseNombresComplexes | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceNombresComplexes {
  exercice: ExerciceNombresComplexes;
  scores: Partial<Record<PhaseNombresComplexes, number>>;
}

export interface EtatSessionNombresComplexes {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceNombresComplexes;
  exerciceCourant: ExerciceNombresComplexes;
  phase: PhaseNombresComplexes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseNombresComplexes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceNombresComplexes[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron 6gen23/6gen28 répliqué ici. */
  derniereTransitionRevelee: boolean;
}
