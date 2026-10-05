/**
 * Couche B (6e) — types pour `6gen8`. Séquence DÉPENDANTE de la famille : 1 écran ("selection"
 * seul, familles A/C — calcul mental raisonnable, aucun écran de calcul symbolique nécessaire) ou
 * 2 écrans ("derivee" → "selection", familles B/D — règle du quotient/réciproque, plus sujette à
 * erreur, calcul symbolique explicite avant le QCM) — même principe que `6gen5`
 * (`typesGraphiquesCyclometriques.ts`).
 */
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseGraphiqueDeriveeExponentielle = "derivee" | "selection";

export function phaseInitiale(exercice: ExerciceGraphiqueDeriveeExponentielle): PhaseGraphiqueDeriveeExponentielle {
  return exercice.famille === "A" || exercice.famille === "C" ? "selection" : "derivee";
}

export function phaseApres(phase: PhaseGraphiqueDeriveeExponentielle): PhaseGraphiqueDeriveeExponentielle | "termine" {
  return phase === "derivee" ? "selection" : "termine";
}

export interface ResultatExerciceGraphiqueDeriveeExponentielle {
  exercice: ExerciceGraphiqueDeriveeExponentielle;
  /** `null` UNIQUEMENT pour les familles A/C — écran "derivee" absent de leur séquence. */
  scoreDerivee: number | null;
  scoreSelection: number;
}

export interface EtatSessionGraphiqueDeriveeExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGraphiqueDeriveeExponentielle;
  exerciceCourant: ExerciceGraphiqueDeriveeExponentielle;
  phase: PhaseGraphiqueDeriveeExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoreDeriveePartiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceGraphiqueDeriveeExponentielle[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse jamais trouvée, révélée) plutôt que par réussite — jamais
   * vrai sur un appel qui ne clôt rien (tentative ratée mais pas encore épuisée) ni sur une
   * clôture par réussite. Existe car `etapeCourante` est réinitialisé (`revelee` remis à false)
   * DANS LE MÊME appel qui fait avancer `phase` — `App6gen8.tsx` ne peut donc pas lire
   * `etat.etapeCourante.revelee` (qui reflète l'état AVANT cette soumission, jamais après) pour
   * capturer le statut `revele` du récapitulatif final ; il doit lire CE champ sur l'état RETOURNÉ
   * par `soumettreReponseXxx` à la place. Voir `docs/historique-6e.md`. */
  derniereTransitionRevelee: boolean;
}
