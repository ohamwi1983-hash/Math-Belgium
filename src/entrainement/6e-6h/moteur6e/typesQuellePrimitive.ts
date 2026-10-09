import type { ExerciceQuellePrimitive } from "../core6e/quellePrimitive.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres as phaseApresBase, phaseInitiale as phaseInitialeBase } from "./typesCalculPrimitives";
import type { PhaseCalculPrimitives } from "./typesCalculPrimitives";

/**
 * Couche B (6e) — types de session pour `6gen24`. RÉUTILISE directement `phaseInitiale`/
 * `phaseApres` de `typesCalculPrimitives.ts` (6gen23, moteur↔moteur — réutilisation libre,
 * CLAUDE.md) pour parcourir les écrans EMPRUNTÉS (familles A/B/C/G), puis ajoute UNE SEULE phase
 * terminale nouvelle : `"final"` (condition initiale F(a)=b → C, puis F(x) complet). Mirroir exact
 * du patron `phaseInitiale`/`phaseApres`/`phasesPourExercice` de 6gen23 (pas de table statique,
 * parcourt la chaîne).
 */

export type PhaseQuellePrimitive = PhaseCalculPrimitives | "final";

export function phaseInitiale(exercice: ExerciceQuellePrimitive): PhaseQuellePrimitive {
  return phaseInitialeBase(exercice.exerciceBase);
}

/** Après la DERNIÈRE phase empruntée à 6gen23 ("termine" côté 6gen23), on enchaîne sur notre propre
 * écran final plutôt que de terminer l'exercice — seule différence avec `phaseApres` de 6gen23. */
export function phaseApres(phase: PhaseQuellePrimitive): PhaseQuellePrimitive | "termine" {
  if (phase === "final") return "termine";
  const suivante = phaseApresBase(phase);
  return suivante === "termine" ? "final" : suivante;
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis (écrans empruntés +
 * écran final) — voir `typesCalculPrimitives.ts` pour le même principe côté 6gen23. */
export function phasesPourExercice(exercice: ExerciceQuellePrimitive): PhaseQuellePrimitive[] {
  const phases: PhaseQuellePrimitive[] = [];
  let phase: PhaseQuellePrimitive | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceQuellePrimitive {
  exercice: ExerciceQuellePrimitive;
  scores: Partial<Record<PhaseQuellePrimitive, number>>;
}

export interface EtatSessionQuellePrimitive {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceQuellePrimitive;
  exerciceCourant: ExerciceQuellePrimitive;
  phase: PhaseQuellePrimitive;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Accumule au fil des écrans de l'exercice COURANT — remis à `{}` à chaque nouvel exercice. */
  scoresPartiels: Partial<Record<PhaseQuellePrimitive, number>>;
  indexExercice: number;
  resultats: ResultatExerciceQuellePrimitive[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron `6gen23` répliqué à l'identique (voir
   * `sessionQuellePrimitive.ts`, fonction `soumettreReponseEcran`). */
  derniereTransitionRevelee: boolean;
}
