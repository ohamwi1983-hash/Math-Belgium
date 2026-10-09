import type { ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { PhaseCalculPrimitives } from "./typesCalculPrimitives";
import { phaseApres as phaseApresPrimitive, phaseInitiale as phaseInitialePrimitive, phasesPourExercice as phasesPourExercicePrimitive } from "./typesCalculPrimitives";

/**
 * Couche B (6e) — types de session pour `6gen25`. N'importe jamais `src/generateurs6e/` (règle
 * non négociable, CLAUDE.md) — importe uniquement `moteur6e/typesCalculPrimitives.ts` (Couche B ↔
 * Couche B, réutilisation libre) pour piloter la portion EMPRUNTÉE de la chaîne d'écrans (6gen23).
 *
 * **Mirroir du patron `phaseInitiale`/`phaseApres` marchant sur une chaîne** établi par 6gen23
 * (jamais une table statique, voir son en-tête) : les phases EMPRUNTÉES (`PhaseCalculPrimitives`)
 * sont déléguées telles quelles à `typesCalculPrimitives.ts` ; quand cette chaîne empruntée
 * s'épuise (`phaseApresPrimitive` renvoie `"termine"`), `phaseApres` ci-dessous bascule vers les
 * écrans PROPRES à 6gen25, qui varient par scénario :
 * - `simple`   : … → `finalIntegrale` → terminé.
 * - `moyenne`  : … → `finalIntegrale` → `valeurMoyenne` → terminé.
 * - `parametre`: … → `poserEquationM` → `resoudreM` → terminé.
 */

export type PhaseIntegralesDefinies = PhaseCalculPrimitives | "finalIntegrale" | "valeurMoyenne" | "poserEquationM" | "resoudreM";

export function phaseInitiale(exercice: ExerciceIntegralesDefinies): PhaseIntegralesDefinies {
  return phaseInitialePrimitive(exercice.primitive);
}

export function phaseApres(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): PhaseIntegralesDefinies | "termine" {
  const chainePrimitive = phasesPourExercicePrimitive(exercice.primitive);
  if (chainePrimitive.includes(phase as PhaseCalculPrimitives)) {
    const suivante = phaseApresPrimitive(phase as PhaseCalculPrimitives);
    if (suivante !== "termine") return suivante;
    // Chaîne empruntée épuisée — bascule vers les écrans propres à 6gen25 (voir en-tête).
    return exercice.scenario === "parametre" ? "poserEquationM" : "finalIntegrale";
  }
  if (phase === "finalIntegrale") return exercice.scenario === "moyenne" ? "valeurMoyenne" : "termine";
  if (phase === "poserEquationM") return "resoudreM";
  return "termine"; // "valeurMoyenne" | "resoudreM"
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis (voir 6gen23,
 * `phasesPourExercice`, même principe : parcourt la chaîne, jamais une table statique). Réutilisée
 * par `ui6e/formatIntegralesDefinies.ts` (récapitulatif) et `sessionIntegralesDefinies.ts`. */
export function phasesPourExercice(exercice: ExerciceIntegralesDefinies): PhaseIntegralesDefinies[] {
  const phases: PhaseIntegralesDefinies[] = [];
  let phase: PhaseIntegralesDefinies | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(exercice, phase);
  }
  return phases;
}

export interface ResultatExerciceIntegralesDefinies {
  exercice: ExerciceIntegralesDefinies;
  scores: Partial<Record<PhaseIntegralesDefinies, number>>;
}

export interface EtatSessionIntegralesDefinies {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceIntegralesDefinies;
  exerciceCourant: ExerciceIntegralesDefinies;
  phase: PhaseIntegralesDefinies;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseIntegralesDefinies, number>>;
  indexExercice: number;
  resultats: ResultatExerciceIntegralesDefinies[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel qui a clos un écran par épuisement des tentatives — piège
   * "revele stale" documenté CLAUDE.md, patron `6gen23` répliqué à l'identique (voir
   * `sessionIntegralesDefinies.ts`, fonction `soumettreReponseEcran`). */
  derniereTransitionRevelee: boolean;
}
