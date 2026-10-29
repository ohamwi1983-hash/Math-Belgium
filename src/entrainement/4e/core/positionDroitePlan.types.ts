/**
 * Couche core — "Position d'une droite par rapport à un plan" (39e générateur, premier du chapitre
 * "Géométrie dans l'espace"). Réutilise directement `Solide3D`/`PlanSolide3D`/`DroiteSolide3D`
 * (`core/geometrieEspace.types.ts`, module frère du chapitre) — jamais un contrat dupliqué.
 *
 * **Aucun calcul visible pour l'élève** — pure reconnaissance géométrique à partir du rendu SVG en
 * perspective cavalière (`components/Solide3DSketch.tsx`). Toute vérité terrain est calculée depuis
 * les coordonnées 3D internes via `moteur/geometrieEspace.ts`, jamais montrée numériquement.
 *
 * **Points nommés** (audit chapitre 8, décision H1a) : en plus des sommets, une droite peut passer
 * par le MILIEU nommé d'une arête (I, J). Sans eux, une droite sécante (définie par 2 sommets)
 * coupait toujours le plan en un de ses sommets — le cas du cours « le point de percée est à
 * l'intérieur d'une arête » n'était jamais entraîné.
 */
import type { DroiteSolide3D, PlanSolide3D, Point3D, Solide3D } from "./geometrieEspace.types";

export type ConclusionPositionDroitePlan = "incluse" | "parallele" | "secante";

/** Milieu nommé d'une arête du solide, ex. I milieu de [EF]. */
export interface PointNommePositionDroitePlan {
  nom: string;
  position: Point3D;
  /** Les 2 sommets de l'arête dont il est le milieu. */
  milieuDe: [string, string];
}

/** Un segment candidat pour l'écran 2, "parallèle" — une arête ou une diagonale du plan désigné,
 * toujours 2 sommets nommés du solide. */
export interface CandidatSegmentPositionDroitePlan {
  type: "segment";
  sommets: [string, string];
  /** Libellé pédagogique, ex. "arête AB" / "diagonale AC" — jamais "déterminant"/"produit scalaire". */
  label: string;
}

/** Une cible candidate pour l'écran 2, "sécante" — un sommet, un point nommé (milieu I...), ou
 * l'intérieur d'une arête (le point de percée tombe alors strictement entre ses extrémités). */
export type CandidatSecantePositionDroitePlan =
  | { type: "sommet"; nom: string }
  | { type: "point"; nom: string }
  | { type: "arete"; sommets: [string, string]; label: string };

export interface ExercicePositionDroitePlan {
  solide: Solide3D;
  /** Les 3 points qui NOMMENT le plan — tirés au hasard parmi les sommets du plan (souvent plus de
   * 3), jamais forcément ceux de la droite : le nom seul ne doit pas trahir la position. */
  plan: PlanSolide3D;
  /** Les 2 points qui définissent la droite — sommets du solide ou points nommés (`pointsNommes`). */
  droite: DroiteSolide3D;
  /** Milieux nommés affichés sur la figure (0, 1 ou 2), tous utilisés par la droite. */
  pointsNommes: PointNommePositionDroitePlan[];
  /** Vérité terrain de l'écran 1 — calculée une fois pour toutes à la génération, jamais redevinée
   * côté présentation. */
  classification: ConclusionPositionDroitePlan;
  /** Rempli uniquement si `classification === "parallele"` — toujours au moins 3 candidats, un
   * seul réellement parallèle à la droite (directions dédupliquées à la construction). */
  candidatsParallele: CandidatSegmentPositionDroitePlan[];
  /** Rempli uniquement si `classification === "secante"` — exactement un candidat contient le point
   * de percée réel (contrainte de génération, vérifiée avant de retenir l'instance). */
  candidatsSecante: CandidatSecantePositionDroitePlan[];
}

export type GenerateurExercicePositionDroitePlan = () => ExercicePositionDroitePlan;

/** Réponse de l'écran 2, adaptée à la catégorie trouvée à l'écran 1 — jamais de texte libre.
 * "incluse" : TOUS les points nommés de la figure (sommets et milieux) qui appartiennent au plan. */
export type ReponseJustificationPositionDroitePlan =
  | { type: "incluse"; points: string[] }
  | { type: "parallele"; indexCandidat: number }
  | { type: "secante"; indexCandidat: number };
