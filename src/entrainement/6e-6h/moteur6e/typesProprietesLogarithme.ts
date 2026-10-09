/**
 * Couche B (6e) — types pour `6gen13`. UNE SEULE famille, 2 écrans FIXES pour tous les types de
 * question (produit/quotient/puissance/racine/composé change seulement la FORMULE, jamais le
 * nombre d'écrans) — donc pas de dispatch `phaseInitiale`/`phaseApres` par famille comme
 * `typesExponentiellesProblemes.ts` (6gen12).
 */
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseProprietesLogarithme = "ecran1" | "ecran2";

export function phaseInitiale(): PhaseProprietesLogarithme {
  return "ecran1";
}

export function phaseApres(phase: PhaseProprietesLogarithme): PhaseProprietesLogarithme | "termine" {
  return phase === "ecran1" ? "ecran2" : "termine";
}

export interface ResultatExerciceProprietesLogarithme {
  exercice: ExerciceProprieteLogarithme;
  scoreEcran1: number;
  scoreEcran2: number;
}

export interface EtatSessionProprietesLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProprieteLogarithme;
  exerciceCourant: ExerciceProprieteLogarithme;
  phase: PhaseProprietesLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Score de l'écran 1, retenu le temps de construire le résultat final à la clôture de l'écran
   * 2 — `null` tant que l'écran 1 n'est pas terminé. */
  scoreEcran1Partiel: number | null;
  indexExercice: number;
  resultats: ResultatExerciceProprietesLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponseXxx` qui a clos un écran par
   * épuisement des tentatives (réponse révélée) plutôt que par réussite — piège structurel
   * documenté dans CLAUDE.md/`docs/conventions-transversales.md` : `etapeCourante.revelee` est
   * remis à `false` DANS LE MÊME appel qui fait avancer `phase`, donc jamais fiable lu depuis
   * l'état PRÉ-transition côté `App6gen13.tsx` — voir `moteur6e/sessionExponentiellesProblemes.ts`
   * (6gen12) pour l'exemple d'origine à répliquer. */
  derniereTransitionRevelee: boolean;
}
