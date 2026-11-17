import type { ExercicePolygones, IdVariantePolygones } from "../core6e/polygonesReguliers.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen97` « Polygones réguliers et racines n-ièmes ». Chaîne
 * FIXE de 4 écrans par variante :
 * - `sommets` : `formule` (choix fermé) → `donnees` (a − c et l'angle) → `sommet1` (Z₁) →
 *   `autresSommets` (Z₂, et Z₃ si n ≥ 4) ;
 * - `mesures` : `rayon` → `cote` → `perimetre` → `aire` ;
 * - `somme-nulle` : `identite` (choix fermé) → `conclusion` (choix fermé) → `somme` (n·c) →
 *   `sansA` (somme des sommets autres que A).
 */

export type PhasePolygones =
  | "formule"
  | "donnees"
  | "sommet1"
  | "autresSommets"
  | "rayon"
  | "cote"
  | "perimetre"
  | "aire"
  | "identite"
  | "conclusion"
  | "somme"
  | "sansA";

export const PHASES_PAR_VARIANTE: Record<IdVariantePolygones, PhasePolygones[]> = {
  sommets: ["formule", "donnees", "sommet1", "autresSommets"],
  mesures: ["rayon", "cote", "perimetre", "aire"],
  "somme-nulle": ["identite", "conclusion", "somme", "sansA"],
};

export function phasesDe(e: ExercicePolygones): PhasePolygones[] {
  return PHASES_PAR_VARIANTE[e.variante];
}

export function phaseApres(e: ExercicePolygones, phase: PhasePolygones): PhasePolygones | "termine" {
  const phases = phasesDe(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

export function estPhaseChoix(phase: PhasePolygones): boolean {
  return phase === "formule" || phase === "identite" || phase === "conclusion";
}

export interface EtatSessionPolygones {
  reglages: ReglagesSession6e;
  generateur: () => ExercicePolygones;
  exerciceCourant: ExercicePolygones;
  phase: PhasePolygones;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhasePolygones, boolean>>;
  aidePartiels: Partial<Record<PhasePolygones, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
