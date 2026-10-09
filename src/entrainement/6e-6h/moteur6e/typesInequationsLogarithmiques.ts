/**
 * Couche B (6e) — types pour `6gen15`. 6 familles STRUCTURELLEMENT DISJOINTES (1 à 4 écrans) —
 * `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une séquence commune
 * (même principe que `typesInequationsExponentielles.ts`, 6gen10).
 */
import type { ExerciceInequationLogarithmique } from "../core6e/inequationsLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseInequationLogarithmique =
  | "aCE"
  | "aResoudre"
  | "bCE"
  | "bResoudre"
  | "cCE"
  | "cCombiner"
  | "cComparer"
  | "dCE"
  | "dReecrire"
  | "dResoudreY"
  | "dConvertirX"
  | "eReconnaitre"
  | "fCE"
  | "fSimplifier"
  | "fConclure";

export function phaseInitiale(exercice: ExerciceInequationLogarithmique): PhaseInequationLogarithmique {
  switch (exercice.famille) {
    case "A":
      return "aCE";
    case "B":
      return "bCE";
    case "C":
      return "cCE";
    case "D":
      return "dCE";
    case "E":
      return "eReconnaitre";
    case "F":
      return "fCE";
  }
}

export function phaseApres(phase: PhaseInequationLogarithmique): PhaseInequationLogarithmique | "termine" {
  switch (phase) {
    case "aCE":
      return "aResoudre";
    case "aResoudre":
      return "termine";
    case "bCE":
      return "bResoudre";
    case "bResoudre":
      return "termine";
    case "cCE":
      return "cCombiner";
    case "cCombiner":
      return "cComparer";
    case "cComparer":
      return "termine";
    case "dCE":
      return "dReecrire";
    case "dReecrire":
      return "dResoudreY";
    case "dResoudreY":
      return "dConvertirX";
    case "dConvertirX":
      return "termine";
    case "eReconnaitre":
      return "termine";
    case "fCE":
      return "fSimplifier";
    case "fSimplifier":
      return "fConclure";
    case "fConclure":
      return "termine";
  }
}

export type ResultatExerciceInequationLogarithmique =
  | { famille: "A"; exercice: ExerciceInequationLogarithmique; scoreCE: number; scoreResoudre: number }
  | { famille: "B"; exercice: ExerciceInequationLogarithmique; scoreCE: number; scoreResoudre: number }
  | { famille: "C"; exercice: ExerciceInequationLogarithmique; scoreCE: number; scoreCombiner: number; scoreComparer: number }
  | { famille: "D"; exercice: ExerciceInequationLogarithmique; scoreCE: number; scoreReecrire: number; scoreResoudreY: number; scoreConvertirX: number }
  | { famille: "E"; exercice: ExerciceInequationLogarithmique; score: number }
  | { famille: "F"; exercice: ExerciceInequationLogarithmique; scoreCE: number; scoreSimplifier: number; scoreConclure: number };

export interface EtatSessionInequationLogarithmique {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceInequationLogarithmique;
  exerciceCourant: ExerciceInequationLogarithmique;
  phase: PhaseInequationLogarithmique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille —
   * voir `phaseInitiale`/`phaseApres`). */
  scoresPartiels: Partial<Record<PhaseInequationLogarithmique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceInequationLogarithmique[];
  terminee: boolean;
  /** `revele` de l'écran qui vient de se refermer suite au DERNIER appel `soumettreReponseXxx` —
   * jamais celui d'un écran antérieur. Piège explicite (voir CLAUDE.md, "Récapitulatif final à
   * plat, coloré" + `sessionExponentiellesProblemes.ts` 6gen12) : `etapeCourante.revelee` est
   * TOUJOURS `false` au moment où l'appelant peut l'observer, car `avancerPhase` réinitialise
   * `etapeCourante` dans LE MÊME appel qui calcule la révélation, avant que l'état ne soit rendu à
   * l'appelant — ce champ est le seul moyen fiable pour `App6gen15.tsx` de capturer la couleur
   * rouge du récapitulatif final. */
  derniereRevelee: boolean;
}
