import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 * `points`/`ordreCyclique`/`facesCroisees` sont la vérité terrain COMPLÈTE du polygone de section,
 * calculée une seule fois à la génération (`generateurs/sectionPlaneSolide/polygoneSection.ts`) —
 * jamais montrée numériquement à l'élève, jamais recalculée différemment en cours d'exercice :
 * l'écran de progression ne fait que découvrir progressivement un SOUS-ENSEMBLE de ces points déjà
 * connus (state vivant, propre à la Couche B — voir `moteur/sessionSectionPlaneSolide.ts`).
 */

export interface PointSectionExercice {
  id: number; // index dans `points`, jamais recalculé différemment côté Couche B
  position: Point3D; // jamais montré numériquement à l'élève
  arete: [string, string]; // l'arête du solide sur laquelle ce point se trouve
  faces: number[]; // index (dans solide.faces) des faces contenant cette arête — 1 ou 2
  labelDepart: "P" | "Q" | "R" | null; // non-null ssi ce point est l'un des points de départ
}

/** Candidat de droite STATIQUE (arête ou diagonale du solide) pour l'écran B — indépendant de
 * l'état vivant de l'exercice, calculé une seule fois. Les segments déjà tracés de la section
 * s'ajoutent dynamiquement en cours d'exercice (Couche B), jamais stockés ici. */
export interface LigneCandidateExercice {
  cle: string;
  label: string; // "arête AB" | "diagonale AC" — jamais montré autrement à l'élève
  points: [Point3D, Point3D];
}

/** Une étape de la résolution de RÉFÉRENCE calculée à la génération (une résolution valable parmi
 * d'autres, jamais imposée à l'élève) — consommée par la correction exportée pour détailler la
 * construction de chaque point auxiliaire (audit chapitre 8, point 26). Les droites sont désignées
 * par les mêmes clés que `LigneCandidateExercice.cle` (`arete:AB`, `diagonale:AC`) ou
 * `segment:a-b` (segment de section déjà tracé, ids de `points`). */
export type EtapeResolutionSection =
  | { type: "segment"; face: number; pointA: number; pointB: number }
  | {
      type: "auxiliaire";
      ligne1: string;
      ligne2: string;
      pointAuxiliaire: Point3D;
      faceCommune: number | null;
      face: number;
      pointConnu: number;
      pointCible: number;
    }
  /** Variantes « faceInterieure » / « prolongement » (manuel, 25/11/2026) : dans une face dont le PLAN
   * contient un point donné qui n'est pas un sommet de la section (`appui`, id de `pointsAppui`) et un
   * point de section connu, la droite qui les joint donne le côté de cette face et son autre extrémité. */
  | { type: "appui"; face: number; appui: number; pointConnu: number; pointCible: number }
  /** Variante « parallele » : côté de la face `face` tracé par `pointConnu`, parallèle au côté
   * `cote` (indice dans `planParallele.cotes`) du triangle KLM ; il coupe une arête en `pointCible`. */
  | { type: "parallele"; face: number; cote: number; pointConnu: number; pointCible: number };

/** Point donné qui n'est PAS un sommet de la section (variantes « faceInterieure » et
 * « prolongement ») — id `ID_APPUI_BASE + i`, jamais un indice de `points` ; figure dans `idsDepart`
 * (donc dans les points connus d'une session) avec sa lettre P, Q ou R. */
export interface PointAppuiExercice {
  id: number;
  position: Point3D;
  nature: "face" | "prolongement";
  /** Nature « face » : la face (index) qui contient le point en son intérieur. */
  face: number | null;
  /** Nature « prolongement » : l'arête dont la DROITE porte le point, hors du segment, et le sommet
   * au-delà duquel il se trouve. */
  arete: [string, string] | null;
  auDelaDe: string | null;
  /** Faces dont le PLAN contient le point (une pour « face », deux pour « prolongement »). */
  facesPlan: number[];
}

export const ID_APPUI_BASE = 100;

/** Variante « parallele » : plan donné (KLM), K, L, M sur les trois arêtes issues de `sommet` ; la
 * section cherchée est celle du plan π parallèle à (KLM) passant par P (`idsDepart[0]`). */
export interface PlanParalleleExercice {
  sommet: string;
  points: { nom: "K" | "L" | "M"; position: Point3D; arete: [string, string] }[];
  /** Les trois côtés [KL], [LM], [KM] (indices dans `points`) et la face du solide qui contient chacun. */
  cotes: { a: number; b: number; face: number }[];
}

export type VarianteManuelSection = "faceInterieure" | "prolongement" | "parallele";

export interface ExerciceSectionPlaneSolide {
  solide: Solide3D;
  plan: [Point3D, Point3D, Point3D]; // le plan de coupe (3 points quelconques, pas nécessairement des sommets nommés)
  points: PointSectionExercice[]; // TOUS les sommets du polygone de section, vérité terrain complète
  ordreCyclique: number[]; // ordre cyclique de vérité terrain — jamais montré à l'élève
  facesCroisees: number[];
  /** Ids de P, Q, R, dans cet ordre — dans `points`, ou dans `pointsAppui` (variantes du manuel) ;
   * variante « parallele » : le seul point donné P. */
  idsDepart: number[];
  lignesStatiques: LigneCandidateExercice[]; // candidats fixes (arêtes + diagonales) de l'écran B
  resolutionReference: EtapeResolutionSection[];
  /** Absent : variantes historiques (gabarits, triangle) — exercices et `?code=` inchangés. */
  variante?: VarianteManuelSection;
  pointsAppui?: PointAppuiExercice[];
  planParallele?: PlanParalleleExercice;
}

export type GenerateurExerciceSectionPlaneSolide = () => ExerciceSectionPlaneSolide;
