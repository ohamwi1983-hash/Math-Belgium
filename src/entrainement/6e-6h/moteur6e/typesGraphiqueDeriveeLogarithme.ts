/**
 * Couche B (6e) — types pour `6gen20`. Séquence FIXE, indépendante de la famille : "derivee" →
 * "selection" — les 3 familles (A/B/C) traversent TOUJOURS les 2 écrans (contrairement à `6gen8`,
 * où les familles A/C n'avaient qu'un seul écran) — voir `core6e/graphiqueDeriveeLogarithme.types.ts`.
 */
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseGraphiqueDeriveeLogarithme = "derivee" | "selection";

export function phaseInitiale(): PhaseGraphiqueDeriveeLogarithme {
  return "derivee";
}

export function phaseApres(phase: PhaseGraphiqueDeriveeLogarithme): PhaseGraphiqueDeriveeLogarithme | "termine" {
  return phase === "derivee" ? "selection" : "termine";
}

export interface ResultatExerciceGraphiqueDeriveeLogarithme {
  exercice: ExerciceGraphiqueDeriveeLogarithme;
  scoreDerivee: number;
  scoreSelection: number;
}

export interface EtatSessionGraphiqueDeriveeLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGraphiqueDeriveeLogarithme;
  exerciceCourant: ExerciceGraphiqueDeriveeLogarithme;
  phase: PhaseGraphiqueDeriveeLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Score de l'écran "derivee", conservé jusqu'à la clôture de l'écran "selection" — `null`
   * uniquement tant que l'écran "derivee" n'est pas encore terminé (jamais `null` dans un
   * `ResultatExerciceGraphiqueDeriveeLogarithme`, toutes les familles traversent cet écran). */
  scoreDeriveePartiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceGraphiqueDeriveeLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse jamais trouvée, révélée) plutôt que par réussite — jamais
   * vrai sur un appel qui ne clôt rien (tentative ratée mais pas encore épuisée) ni sur une
   * clôture par réussite. Existe car `etapeCourante` est réinitialisé (`revelee` remis à false)
   * DANS LE MÊME appel qui fait avancer `phase` — `App6gen20.tsx` ne peut donc pas lire
   * `etat.etapeCourante.revelee` (qui reflète l'état AVANT cette soumission, jamais après) pour
   * capturer le statut `revele` du récapitulatif final ; il doit lire CE champ sur l'état RETOURNÉ
   * par `soumettreReponseXxx` à la place. Voir `docs/historique-6e.md` (6gen8/6gen16, même piège). */
  derniereTransitionRevelee: boolean;
}
