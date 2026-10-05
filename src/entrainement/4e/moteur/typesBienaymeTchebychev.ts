/**
 * Couche B — types de session pour "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — refonte
 * complète, 20 écrans possibles au total répartis sur 8 variantes, chacune une SÉQUENCE FIXE et
 * DISJOINTE des 7 autres (aucun nom de phase partagé entre deux variantes, même principe
 * qu'"Orthogonalité et théorème de Pythagore généralisé") :
 * - `intervalleVersPourcent` (V1) : v1K → v1Pourcent (2 écrans).
 * - `pourcentVersIntervalle` (V2) : v2K → v2Intervalle (2 écrans).
 * - `intervalleVersNombre` (V3)   : v3K → v3Pourcent → v3Nombre (3 écrans).
 * - `nombreVersIntervalle` (V4)   : v4Pourcent0 → v4K → v4Intervalle (3 écrans).
 * - `intervalleVersSigma` (V5)    : v5K → v5Sigma (2 écrans).
 * - `intervalleVersXBar` (V6)     : v6K → v6XBar (2 écrans).
 * - `nombreVersSigma` (V7)        : v7Pourcent0 → v7K → v7Sigma (3 écrans).
 * - `nombreVersXBar` (V8)         : v8Pourcent0 → v8K → v8XBar (3 écrans).
 */
import type { ExerciceBienaymeTchebychev, GenerateurExerciceBienaymeTchebychev, VarianteBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export type PhaseBienaymeTchebychev =
  | "v1K"
  | "v1Pourcent"
  | "v2K"
  | "v2Intervalle"
  | "v3K"
  | "v3Pourcent"
  | "v3Nombre"
  | "v4Pourcent0"
  | "v4K"
  | "v4Intervalle"
  | "v5K"
  | "v5Sigma"
  | "v6K"
  | "v6XBar"
  | "v7Pourcent0"
  | "v7K"
  | "v7Sigma"
  | "v8Pourcent0"
  | "v8K"
  | "v8XBar";

export const SEQUENCES: Record<VarianteBienaymeTchebychev, PhaseBienaymeTchebychev[]> = {
  intervalleVersPourcent: ["v1K", "v1Pourcent"],
  pourcentVersIntervalle: ["v2K", "v2Intervalle"],
  intervalleVersNombre: ["v3K", "v3Pourcent", "v3Nombre"],
  nombreVersIntervalle: ["v4Pourcent0", "v4K", "v4Intervalle"],
  intervalleVersSigma: ["v5K", "v5Sigma"],
  intervalleVersXBar: ["v6K", "v6XBar"],
  nombreVersSigma: ["v7Pourcent0", "v7K", "v7Sigma"],
  nombreVersXBar: ["v8Pourcent0", "v8K", "v8XBar"],
};

/** Niveau d'aide maximal par écran, voir `promptgen37refonte.md` (section par variante) — pénalité
 * ADDITIVE `-20 points/niveau`, même mécanique que "Colinéarité"/"Orthogonalité"/"Triangle
 * quelconque". Un écran à `max=0` (`v3Nombre`, `v4Pourcent0`/`v7Pourcent0`/`v8Pourcent0`) n'affiche
 * aucun bouton "Aide" côté composant, jamais un bouton perpétuellement désactivé. */
export const NIVEAU_AIDE_MAX: Record<PhaseBienaymeTchebychev, number> = {
  v1K: 2,
  v1Pourcent: 2,
  v2K: 2,
  v2Intervalle: 1,
  v3K: 2,
  v3Pourcent: 2,
  v3Nombre: 0,
  v4Pourcent0: 0,
  v4K: 2,
  v4Intervalle: 1,
  v5K: 2,
  v5Sigma: 2,
  v6K: 2,
  v6XBar: 2,
  v7Pourcent0: 0,
  v7K: 2,
  v7Sigma: 2,
  v8Pourcent0: 0,
  v8K: 2,
  v8XBar: 2,
};

export interface ScoreEcran {
  score: number;
  revele: boolean;
  niveauAide: number;
}

export interface ResultatExerciceBienaymeTchebychev {
  variante: VarianteBienaymeTchebychev;
  scoreV1K: number | null;
  v1KRevele: boolean;
  niveauAideV1K: number;
  scoreV1Pourcent: number | null;
  v1PourcentRevele: boolean;
  niveauAideV1Pourcent: number;
  scoreV2K: number | null;
  v2KRevele: boolean;
  niveauAideV2K: number;
  scoreV2Intervalle: number | null;
  v2IntervalleRevele: boolean;
  niveauAideV2Intervalle: number;
  scoreV3K: number | null;
  v3KRevele: boolean;
  niveauAideV3K: number;
  scoreV3Pourcent: number | null;
  v3PourcentRevele: boolean;
  niveauAideV3Pourcent: number;
  scoreV3Nombre: number | null;
  v3NombreRevele: boolean;
  niveauAideV3Nombre: number;
  scoreV4Pourcent0: number | null;
  v4Pourcent0Revele: boolean;
  niveauAideV4Pourcent0: number;
  scoreV4K: number | null;
  v4KRevele: boolean;
  niveauAideV4K: number;
  scoreV4Intervalle: number | null;
  v4IntervalleRevele: boolean;
  niveauAideV4Intervalle: number;
  scoreV5K: number | null;
  v5KRevele: boolean;
  niveauAideV5K: number;
  scoreV5Sigma: number | null;
  v5SigmaRevele: boolean;
  niveauAideV5Sigma: number;
  scoreV6K: number | null;
  v6KRevele: boolean;
  niveauAideV6K: number;
  scoreV6XBar: number | null;
  v6XBarRevele: boolean;
  niveauAideV6XBar: number;
  scoreV7Pourcent0: number | null;
  v7Pourcent0Revele: boolean;
  niveauAideV7Pourcent0: number;
  scoreV7K: number | null;
  v7KRevele: boolean;
  niveauAideV7K: number;
  scoreV7Sigma: number | null;
  v7SigmaRevele: boolean;
  niveauAideV7Sigma: number;
  scoreV8Pourcent0: number | null;
  v8Pourcent0Revele: boolean;
  niveauAideV8Pourcent0: number;
  scoreV8K: number | null;
  v8KRevele: boolean;
  niveauAideV8K: number;
  scoreV8XBar: number | null;
  v8XBarRevele: boolean;
  niveauAideV8XBar: number;
}

export interface EtatSessionBienaymeTchebychev {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceBienaymeTchebychev;
  indexExercice: number;
  exerciceCourant: ExerciceBienaymeTchebychev;
  phase: PhaseBienaymeTchebychev;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide de l'ÉCRAN COURANT uniquement — remis à 0 à chaque transition de phase (même
   * principe que "Colinéarité"/"Orthogonalité"). */
  niveauAide: number;
  /** Écrans déjà clos de CET exercice, accumulés jusqu'à la clôture complète (qui construit le
   * `ResultatExerciceBienaymeTchebychev` final via `construireResultat`,
   * `sessionBienaymeTchebychev.ts`). */
  scoresAccumules: Partial<Record<PhaseBienaymeTchebychev, ScoreEcran>>;
  resultats: ResultatExerciceBienaymeTchebychev[];
  terminee: boolean;
}
