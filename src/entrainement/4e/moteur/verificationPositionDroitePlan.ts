import type {
  ConclusionPositionDroitePlan,
  ExercicePositionDroitePlan,
  ReponseJustificationPositionDroitePlan,
} from "../core/positionDroitePlan.types";
import type { Point3D } from "../core/geometrieEspace.types";
import { distance3D, EPSILON_3D, intersectionDroitePlan, pointAppartientAuPlan, pointSurSegmentOuvert, sontParalleles3D, soustraire3D } from "./geometrieEspace";

/**
 * Couche B — vérification "Position d'une droite par rapport à un plan". Logique CATÉGORIELLE pure
 * (sélection/choix, jamais de saisie libre) — aucun statut à 3 valeurs `StatutVerification` ici, il
 * n'y a aucune équivalence algébrique à tester. Toute comparaison est calculée depuis les
 * coordonnées 3D internes via `moteur/geometrieEspace.ts`, jamais une simple comparaison d'un index
 * stocké contre un autre — un candidat est vérifié GÉOMÉTRIQUEMENT, pas par comparaison d'identité.
 */

/** Position 3D d'un point nommé de la figure — un sommet du solide, ou un milieu nommé (I, J). */
export function positionPointNomme(exercice: ExercicePositionDroitePlan, nom: string): Point3D | null {
  const sommet = exercice.solide.sommets[nom];
  if (sommet) return sommet;
  return exercice.pointsNommes.find((p) => p.nom === nom)?.position ?? null;
}

/** Tous les points nommés de la figure (sommets puis milieux), dans l'ordre d'affichage. */
export function nomsPointsFigure(exercice: ExercicePositionDroitePlan): string[] {
  return [...Object.keys(exercice.solide.sommets), ...exercice.pointsNommes.map((p) => p.nom)];
}

function pointsDuPlan(exercice: ExercicePositionDroitePlan): [Point3D, Point3D, Point3D] {
  const [p1, p2, p3] = exercice.plan;
  return [exercice.solide.sommets[p1], exercice.solide.sommets[p2], exercice.solide.sommets[p3]];
}

function extremitesDroite(exercice: ExercicePositionDroitePlan): [Point3D, Point3D] {
  return [positionPointNomme(exercice, exercice.droite[0])!, positionPointNomme(exercice, exercice.droite[1])!];
}

/** Les points nommés de la figure qui appartiennent au plan — réponse attendue de l'écran 2
 * "incluse" (le plan en contient presque toujours plus que les 3 de son nom). */
export function pointsFigureDansLePlan(exercice: ExercicePositionDroitePlan): string[] {
  const plan = pointsDuPlan(exercice);
  return nomsPointsFigure(exercice).filter((nom) => pointAppartientAuPlan(positionPointNomme(exercice, nom)!, plan));
}

export function verifierClassification(exercice: ExercicePositionDroitePlan, reponse: ConclusionPositionDroitePlan): boolean {
  return reponse === exercice.classification;
}

/** Écran 2, cas "incluse" : l'ensemble (sans ordre) des points sélectionnés doit être EXACTEMENT
 * celui des points nommés de la figure qui appartiennent au plan. */
export function verifierReponseIncluse(exercice: ExercicePositionDroitePlan, points: string[]): boolean {
  const choisis = new Set(points);
  const attendus = new Set(pointsFigureDansLePlan(exercice));
  if (choisis.size !== points.length || choisis.size !== attendus.size) return false;
  return [...choisis].every((nom) => attendus.has(nom));
}

/** Écran 2, cas "parallèle" : le segment candidat désigné par son index doit être RÉELLEMENT
 * parallèle à la droite (test géométrique direct, jamais une comparaison d'index "correct"). */
export function verifierReponseParallele(exercice: ExercicePositionDroitePlan, indexCandidat: number): boolean {
  const candidat = exercice.candidatsParallele[indexCandidat];
  if (!candidat) return false;
  const directionCandidat = soustraire3D(exercice.solide.sommets[candidat.sommets[1]], exercice.solide.sommets[candidat.sommets[0]]);
  const [a, b] = extremitesDroite(exercice);
  return sontParalleles3D(directionCandidat, soustraire3D(b, a));
}

/** Point de percée réel de la droite dans le plan — `null` si elle n'est pas sécante. */
export function pointDePercee(exercice: ExercicePositionDroitePlan): Point3D | null {
  return intersectionDroitePlan(extremitesDroite(exercice), pointsDuPlan(exercice));
}

/** Écran 2, cas "sécante" : la cible désignée (sommet, point nommé ou intérieur d'arête) doit
 * RÉELLEMENT contenir le point de percée — recalculé ici, jamais lu depuis une valeur en cache. */
export function verifierReponseSecante(exercice: ExercicePositionDroitePlan, indexCandidat: number): boolean {
  const candidat = exercice.candidatsSecante[indexCandidat];
  if (!candidat) return false;
  const intersection = pointDePercee(exercice);
  if (!intersection) return false;

  if (candidat.type === "sommet" || candidat.type === "point") {
    const position = positionPointNomme(exercice, candidat.nom);
    return position !== null && distance3D(position, intersection) < EPSILON_3D;
  }
  const [a, b] = candidat.sommets;
  return pointSurSegmentOuvert(intersection, exercice.solide.sommets[a], exercice.solide.sommets[b]);
}

/** Dispatch générique de l'écran 2 — la forme de `reponse` doit correspondre à
 * `exercice.classification` (garanti par la Couche B, qui ne construit jamais l'écran 2 avec une
 * autre forme que celle attendue). */
export function verifierJustification(exercice: ExercicePositionDroitePlan, reponse: ReponseJustificationPositionDroitePlan): boolean {
  if (reponse.type !== exercice.classification) return false;
  if (reponse.type === "incluse") return verifierReponseIncluse(exercice, reponse.points);
  if (reponse.type === "parallele") return verifierReponseParallele(exercice, reponse.indexCandidat);
  return verifierReponseSecante(exercice, reponse.indexCandidat);
}
