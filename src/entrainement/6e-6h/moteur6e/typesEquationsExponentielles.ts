/**
 * Couche B (6e) — types pour `6gen9`. 4 familles STRUCTURELLEMENT DISJOINTES (2, 2, 3 ou 1 écrans)
 * — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`, jamais une séquence commune
 * (même principe que `typesEquationsCyclometriques.ts`, 6gen3). Les phases restent les mêmes pour
 * les 3 sous-types de A (A1/A2/A3 ont toutes les deux le même NOMBRE d'écrans, seul leur contenu/
 * leur forme de réponse diffère — dispatché côté présentation/moteur sur `exercice.sousType`, pas
 * sur un nom de phase distinct) ; même principe pour les 3 styles de C et les 2 sous-types de D.
 */
import type { ExerciceEquationExponentielle } from "../core6e/equationsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEquationExponentielle = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "cEcran3" | "dEcran";

export function phaseInitiale(exercice: ExerciceEquationExponentielle): PhaseEquationExponentielle {
  switch (exercice.famille) {
    case "A":
      return "aEcran1";
    case "B":
      return "bEcran1";
    case "C":
      return "cEcran1";
    case "D":
      return "dEcran";
  }
}

export function phaseApres(phase: PhaseEquationExponentielle): PhaseEquationExponentielle | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bEcran1":
      return "bEcran2";
    case "bEcran2":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
    case "dEcran":
      return "termine";
  }
}

export type ResultatExerciceEquationExponentielle =
  | { famille: "A"; exercice: ExerciceEquationExponentielle; scoreEcran1: number; scoreEcran2: number }
  | { famille: "B"; exercice: ExerciceEquationExponentielle; scoreEcran1: number; scoreEcran2: number }
  | { famille: "C"; exercice: ExerciceEquationExponentielle; scoreEcran1: number; scoreEcran2: number; scoreEcran3: number }
  | { famille: "D"; exercice: ExerciceEquationExponentielle; score: number };

export interface EtatSessionEquationExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEquationExponentielle;
  exerciceCourant: ExerciceEquationExponentielle;
  phase: PhaseEquationExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans (l'ensemble de phases réellement traversées varie par famille —
   * voir `phaseInitiale`/`phaseApres` — même principe que 5gen6/5gen10/5gen12/5gen13/6gen3/6gen6). */
  scoresPartiels: Partial<Record<PhaseEquationExponentielle, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEquationExponentielle[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse jamais trouvée, révélée) plutôt que par réussite — jamais
   * vrai sur un appel qui ne clôt rien (tentative ratée mais pas encore épuisée) ni sur une
   * clôture par réussite. Existe car `etapeCourante` est réinitialisé (`revelee` remis à false)
   * DANS LE MÊME appel qui fait avancer `phase` — `App6gen9.tsx` ne peut donc pas lire
   * `etat.etapeCourante.revelee` (qui reflète l'état AVANT cette soumission, jamais après) pour
   * capturer le statut `revele` du récapitulatif final ; il doit lire CE champ sur l'état RETOURNÉ
   * par `soumettreReponseXxx` à la place. Voir `docs/historique-6e.md`. */
  derniereTransitionRevelee: boolean;
}
