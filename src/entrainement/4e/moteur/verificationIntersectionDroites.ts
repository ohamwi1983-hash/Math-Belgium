/**
 * Couche B — vérification de "Intersection entre deux droites". Réutilise directement les
 * primitives déjà partagées du groupe "droites" (`verificationDroite.ts`, module frère — import
 * moteur→moteur explicitement autorisé, voir Architecture CLAUDE.md) : `combinerStatuts`/
 * `statutNumerique` pour le statut à 3 valeurs de l'écran 2, `ReponseIntersection`/
 * `diagnostiquerIntersection` pour les coordonnées finales du point.
 *
 * **Écran 1 — purement catégoriel, aucun statut à 3 valeurs** (même principe que
 * `verificationPositionDroitePlan.ts`) : aucune saisie libre, donc aucun risque de `parse_error`.
 */
import type { ConclusionIntersectionDroites, ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import { combinerStatuts, statutNumerique, type ReponseIntersection } from "./verificationDroite";
import type { StatutVerification } from "./statutVerification";

export function verifierDiagnostic(exercice: ExerciceIntersectionDroites, reponse: ConclusionIntersectionDroites): boolean {
  return reponse === exercice.conclusion;
}

/** Le paramètre `t`/`s` (écran 2) — `null` quand la donnée n'est pas demandée (ligne cartésienne
 * de ce côté), auquel cas il n'y a rien à saisir ni à vérifier. */
export interface ReponsePoint {
  t: number | null;
  s: number | null;
  point: ReponseIntersection;
}

/** Statut combiné, un champ par sous-partie de la réponse — permet à l'UI de marquer chaque champ
 * indépendamment (le paramètre `t`/`s` et les coordonnées du point restent des notions distinctes,
 * jamais fusionnées en un seul statut opaque). `null` reflète l'absence de la donnée correspondante
 * sur l'exercice (jamais un champ non atteint confondu avec un champ correct). */
export interface StatutPointIntersection {
  t: StatutVerification | null;
  s: StatutVerification | null;
  point: StatutVerification;
}

export function diagnostiquerPoint(exercice: ExerciceIntersectionDroites, reponse: ReponsePoint): StatutPointIntersection {
  const cible = exercice.point;
  if (!cible) throw new Error("diagnostiquerPoint appelée sur un exercice sans point d'intersection (cas non sécant)");

  const t = exercice.tAttendu === null ? null : statutNumerique(reponse.t ?? Number.NaN, exercice.tAttendu);
  const s = exercice.sAttendu === null ? null : statutNumerique(reponse.s ?? Number.NaN, exercice.sAttendu);
  const point = combinerStatuts(statutNumerique(reponse.point.x, cible.x), statutNumerique(reponse.point.y, cible.y));

  return { t, s, point };
}

export function verifierPoint(exercice: ExerciceIntersectionDroites, reponse: ReponsePoint): boolean {
  const statut = diagnostiquerPoint(exercice, reponse);
  return (statut.t === null || statut.t === "correct") && (statut.s === null || statut.s === "correct") && statut.point === "correct";
}
