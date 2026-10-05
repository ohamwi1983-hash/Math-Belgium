import type {
  ConclusionPositionDroitePlan,
  ExercicePositionDroitePlan,
  ReponseJustificationPositionDroitePlan,
} from "../core/positionDroitePlan.types";
import { distance3D, EPSILON_3D, intersectionDroitePlan, pointSurSegmentOuvert, sontParalleles3D, soustraire3D } from "./geometrieEspace";

/**
 * Couche B — vérification "Position d'une droite par rapport à un plan". Logique CATÉGORIELLE pure
 * (sélection/choix, jamais de saisie libre) — aucun statut à 3 valeurs `StatutVerification` ici, il
 * n'y a aucune équivalence algébrique à tester (spec, section "Vérification"). Toute comparaison est
 * calculée depuis les coordonnées 3D internes via `moteur/geometrieEspace.ts` (import moteur→moteur,
 * même principe que `verificationTriangle.ts`/chapitre 3), jamais une simple comparaison d'un index
 * stocké contre un autre — un candidat est vérifié GÉOMÉTRIQUEMENT, pas par comparaison d'identité.
 */

export function verifierClassification(exercice: ExercicePositionDroitePlan, reponse: ConclusionPositionDroitePlan): boolean {
  return reponse === exercice.classification;
}

/** Écran 2, cas "incluse" : l'ensemble (sans ordre) des 2 sommets sélectionnés doit être exactement
 * celui qui définit la droite de l'exercice. */
export function verifierReponseIncluse(exercice: ExercicePositionDroitePlan, sommets: [string, string]): boolean {
  if (new Set(sommets).size !== 2) return false;
  const attendu = new Set(exercice.droite);
  return sommets.every((s) => attendu.has(s));
}

/** Écran 2, cas "parallèle" : le segment candidat désigné par son index doit être RÉELLEMENT
 * parallèle à la droite (test géométrique direct, jamais une comparaison d'index "correct"). */
export function verifierReponseParallele(exercice: ExercicePositionDroitePlan, indexCandidat: number): boolean {
  const candidat = exercice.candidatsParallele[indexCandidat];
  if (!candidat) return false;
  const directionCandidat = soustraire3D(exercice.solide.sommets[candidat.sommets[1]], exercice.solide.sommets[candidat.sommets[0]]);
  const directionDroite = soustraire3D(exercice.solide.sommets[exercice.droite[1]], exercice.solide.sommets[exercice.droite[0]]);
  return sontParalleles3D(directionCandidat, directionDroite);
}

/** Écran 2, cas "sécante" : la cible désignée (sommet ou arête) doit RÉELLEMENT contenir le point
 * d'intersection réel droite/plan — recalculé ici, jamais lu depuis une valeur mise en cache. */
export function verifierReponseSecante(exercice: ExercicePositionDroitePlan, indexCandidat: number): boolean {
  const candidat = exercice.candidatsSecante[indexCandidat];
  if (!candidat) return false;

  const [d1, d2] = exercice.droite;
  const [p1, p2, p3] = exercice.plan;
  const intersection = intersectionDroitePlan(
    [exercice.solide.sommets[d1], exercice.solide.sommets[d2]],
    [exercice.solide.sommets[p1], exercice.solide.sommets[p2], exercice.solide.sommets[p3]],
  );
  if (!intersection) return false;

  if (candidat.type === "sommet") {
    return distance3D(exercice.solide.sommets[candidat.nom], intersection) < EPSILON_3D;
  }
  const [a, b] = candidat.sommets;
  return pointSurSegmentOuvert(intersection, exercice.solide.sommets[a], exercice.solide.sommets[b]);
}

/** Dispatch générique de l'écran 2 — la forme de `reponse` doit correspondre à
 * `exercice.classification` (garanti par la Couche B, qui ne construit jamais l'écran 2 avec une
 * autre forme que celle attendue). */
export function verifierJustification(exercice: ExercicePositionDroitePlan, reponse: ReponseJustificationPositionDroitePlan): boolean {
  if (reponse.type !== exercice.classification) return false;
  if (reponse.type === "incluse") return verifierReponseIncluse(exercice, reponse.sommets);
  if (reponse.type === "parallele") return verifierReponseParallele(exercice, reponse.indexCandidat);
  return verifierReponseSecante(exercice, reponse.indexCandidat);
}
