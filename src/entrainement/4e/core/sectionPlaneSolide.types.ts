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
  labelDepart: "P" | "Q" | "R" | null; // non-null ssi ce point est l'un des 3 points de départ
}

/** Candidat de droite STATIQUE (arête ou diagonale du solide) pour l'écran B — indépendant de
 * l'état vivant de l'exercice, calculé une seule fois. Les segments déjà tracés de la section
 * s'ajoutent dynamiquement en cours d'exercice (Couche B), jamais stockés ici. */
export interface LigneCandidateExercice {
  cle: string;
  label: string; // "arête AB" | "diagonale AC" — jamais montré autrement à l'élève
  points: [Point3D, Point3D];
}

export interface ExerciceSectionPlaneSolide {
  solide: Solide3D;
  plan: [Point3D, Point3D, Point3D]; // le plan de coupe (3 points quelconques, pas nécessairement des sommets nommés)
  points: PointSectionExercice[]; // TOUS les sommets du polygone de section, vérité terrain complète
  ordreCyclique: number[]; // ordre cyclique de vérité terrain — jamais montré à l'élève
  facesCroisees: number[];
  idsDepart: [number, number, number]; // ids (dans `points`) de P, Q, R, dans cet ordre
  lignesStatiques: LigneCandidateExercice[]; // candidats fixes (arêtes + diagonales) de l'écran B
}

export type GenerateurExerciceSectionPlaneSolide = () => ExerciceSectionPlaneSolide;
