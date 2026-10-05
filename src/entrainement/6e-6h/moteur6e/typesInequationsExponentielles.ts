/**
 * Couche B (6e) — types pour `6gen10`. 5 familles STRUCTURELLEMENT DISJOINTES (1 à 3 écrans) —
 * `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille` (+ `sousType` pour C/D), jamais
 * une séquence commune (même principe que `typesEquationsCyclometriques.ts`, 6gen3).
 */
import type { ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseInequationExponentielle =
  | "aReconnaitre"
  | "aResoudre"
  | "bReconnaitre"
  | "cfReconnaitre"
  | "ckRegrouper"
  | "ckConclure"
  | "dConstantSigne"
  | "dConstantResoudre"
  | "dVariableSigne1"
  | "dVariableSigne2"
  | "dVariableTableau"
  | "eRegrouper"
  | "eResoudre";

export function phaseInitiale(exercice: ExerciceInequationExponentielle): PhaseInequationExponentielle {
  switch (exercice.famille) {
    case "A":
      return "aReconnaitre";
    case "B":
      return "bReconnaitre";
    case "C":
      return exercice.sousType === "f" ? "cfReconnaitre" : "ckRegrouper";
    case "D":
      return exercice.sousType === "constant" ? "dConstantSigne" : "dVariableSigne1";
    case "E":
      return "eRegrouper";
  }
}

export function phaseApres(phase: PhaseInequationExponentielle): PhaseInequationExponentielle | "termine" {
  switch (phase) {
    case "aReconnaitre":
      return "aResoudre";
    case "aResoudre":
      return "termine";
    case "bReconnaitre":
      return "termine";
    case "cfReconnaitre":
      return "termine";
    case "ckRegrouper":
      return "ckConclure";
    case "ckConclure":
      return "termine";
    case "dConstantSigne":
      return "dConstantResoudre";
    case "dConstantResoudre":
      return "termine";
    case "dVariableSigne1":
      return "dVariableSigne2";
    case "dVariableSigne2":
      return "dVariableTableau";
    case "dVariableTableau":
      return "termine";
    case "eRegrouper":
      return "eResoudre";
    case "eResoudre":
      return "termine";
  }
}

export type ResultatExerciceInequationExponentielle =
  | { famille: "A"; exercice: ExerciceInequationExponentielle; scoreReconnaitre: number; scoreResoudre: number }
  | { famille: "B"; exercice: ExerciceInequationExponentielle; score: number }
  | { famille: "C"; sousType: "f"; exercice: ExerciceInequationExponentielle; score: number }
  | { famille: "C"; sousType: "k"; exercice: ExerciceInequationExponentielle; scoreRegrouper: number; scoreConclure: number }
  | { famille: "D"; sousType: "constant"; exercice: ExerciceInequationExponentielle; scoreSigne: number; scoreResoudre: number }
  | { famille: "D"; sousType: "variable"; exercice: ExerciceInequationExponentielle; scoreSigne1: number; scoreSigne2: number; scoreTableau: number }
  | { famille: "E"; exercice: ExerciceInequationExponentielle; scoreRegrouper: number; scoreResoudre: number };

export interface EtatSessionInequationExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceInequationExponentielle;
  exerciceCourant: ExerciceInequationExponentielle;
  phase: PhaseInequationExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille/
   * sous-type — voir `phaseInitiale`/`phaseApres` — même principe que 6gen3/6gen6/6gen9). */
  scoresPartiels: Partial<Record<PhaseInequationExponentielle, number>>;
  indexExercice: number;
  resultats: ResultatExerciceInequationExponentielle[];
  terminee: boolean;
  /** `revele` de l'écran qui vient de se refermer suite au DERNIER appel `soumettreReponseXxx`
   * (`true` seulement si les tentatives ont été épuisées SANS réponse correcte) — jamais celui
   * d'un écran antérieur. Piège explicite (voir CLAUDE.md, "Récapitulatif final à plat, coloré") :
   * `etapeCourante.revelee` est TOUJOURS `false` au moment où l'appelant peut l'observer, car
   * `avancerPhase` réinitialise `etapeCourante` (`demarrerEtapeTentatives()`) dans LE MÊME appel
   * qui calcule la révélation, avant que l'état ne soit rendu à l'appelant — ce champ est le seul
   * moyen fiable pour `App6gen10.tsx` de capturer la couleur rouge du récapitulatif final. */
  derniereRevelee: boolean;
}
