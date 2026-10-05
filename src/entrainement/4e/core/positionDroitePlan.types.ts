/**
 * Couche core — "Position d'une droite par rapport à un plan" (39e générateur, premier du chapitre
 * "Géométrie dans l'espace"). Réutilise directement `Solide3D`/`PlanSolide3D`/`DroiteSolide3D`
 * (`core/geometrieEspace.types.ts`, module frère du chapitre) — jamais un contrat dupliqué.
 *
 * **Aucun calcul visible pour l'élève** — pure reconnaissance géométrique à partir du rendu SVG en
 * perspective cavalière (`components/Solide3DSketch.tsx`). Toute vérité terrain est calculée depuis
 * les coordonnées 3D internes via `moteur/geometrieEspace.ts`, jamais montrée numériquement.
 */
import type { DroiteSolide3D, PlanSolide3D, Solide3D } from "./geometrieEspace.types";

export type ConclusionPositionDroitePlan = "incluse" | "parallele" | "secante";

/** Un segment candidat pour l'écran 2, "parallèle" — une arête ou une diagonale du plan désigné,
 * toujours 2 sommets nommés du solide. */
export interface CandidatSegmentPositionDroitePlan {
  type: "segment";
  sommets: [string, string];
  /** Libellé pédagogique, ex. "arête AB" / "diagonale AC" — jamais "déterminant"/"produit scalaire". */
  label: string;
}

/** Une cible candidate pour l'écran 2, "sécante" — soit un sommet nommé, soit une arête (le point
 * d'intersection tombe alors strictement à l'intérieur de cette arête, jamais à ses extrémités). */
export type CandidatSecantePositionDroitePlan =
  | { type: "sommet"; nom: string }
  | { type: "arete"; sommets: [string, string]; label: string };

export interface ExercicePositionDroitePlan {
  solide: Solide3D;
  plan: PlanSolide3D;
  droite: DroiteSolide3D;
  /** Vérité terrain de l'écran 1 — calculée une fois pour toutes à la génération via
   * `classifierDroitePlan`, jamais redevinée côté présentation. */
  classification: ConclusionPositionDroitePlan;
  /** Rempli uniquement si `classification === "parallele"` — toujours au moins 3 candidats, un
   * seul réellement parallèle à la droite (directions dédupliquées à la construction). */
  candidatsParallele: CandidatSegmentPositionDroitePlan[];
  /** Rempli uniquement si `classification === "secante"` — le point d'intersection réel tombe
   * TOUJOURS exactement sur l'un des candidats proposés (contrainte de génération, vérifiée avant
   * de retenir l'instance). */
  candidatsSecante: CandidatSecantePositionDroitePlan[];
}

export type GenerateurExercicePositionDroitePlan = () => ExercicePositionDroitePlan;

/** Réponse de l'écran 2, adaptée à la catégorie trouvée à l'écran 1 — jamais de texte libre. */
export type ReponseJustificationPositionDroitePlan =
  | { type: "incluse"; sommets: [string, string] }
  | { type: "parallele"; indexCandidat: number }
  | { type: "secante"; indexCandidat: number };
