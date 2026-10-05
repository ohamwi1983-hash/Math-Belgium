/**
 * Couche B — vérification propre à "Construction graphique — tracer une droite depuis son
 * équation". Réutilise `pointAppartientImplicite` (`verificationDroite.ts`) comme SEULE primitive
 * de membership — quelle que soit `exercice.variante`, `referenceImplicite` décrit exactement la
 * même droite que le champ actif du contrat, donc l'appartenance à l'une équivaut à l'appartenance
 * à l'autre : aucun dispatch par forme n'est nécessaire côté vérification, contrairement à la
 * Couche A qui doit, elle, calculer chaque forme concrètement pour l'affichage.
 */
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";
import { combinerStatuts, pointAppartientImplicite } from "./verificationDroite";

// ============================================================================
// Écran 1 — produire 2 points ENTIERS et DISTINCTS de la droite, vérifiés par APPARTENANCE, jamais
// par égalité à une paire pré-déterminée (n'importe quelle paire valide est acceptée).
// ============================================================================

export interface ReponsePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** `parse_error` si non fini ; `not_equivalent` si fini mais non entier OU hors de la droite ;
 * `correct` sinon. Un point à coordonnées non entières n'est jamais un `parse_error` — c'est une
 * saisie parfaitement valide, simplement pas la nature de réponse demandée (l'écran 2 exige un
 * placement CRANTÉ, donc une cible entière). */
function statutPointConstruction(exercice: ExerciceConstructionDroite, point: Point): StatutVerification {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return "parse_error";
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) return "not_equivalent";
  return pointAppartientImplicite(point, exercice.referenceImplicite) ? "correct" : "not_equivalent";
}

export function diagnostiquerPoints(exercice: ExerciceConstructionDroite, reponse: ReponsePoints): StatutVerification {
  const p1: Point = { x: reponse.x1, y: reponse.y1 };
  const p2: Point = { x: reponse.x2, y: reponse.y2 };
  const statut = combinerStatuts(statutPointConstruction(exercice, p1), statutPointConstruction(exercice, p2));
  if (statut !== "correct") return statut;
  return p1.x === p2.x && p1.y === p2.y ? "not_equivalent" : "correct";
}

export function verifierPoints(exercice: ExerciceConstructionDroite, reponse: ReponsePoints): boolean {
  return diagnostiquerPoints(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 2 — tracer, par glissement CRANTÉ, exactement les 2 points validés (ou révélés) à l'écran
// 1 — comparaison exacte (aucune tolérance), correspondance non ordonnée (l'élève peut placer
// n'importe lequel de ses 2 marqueurs sur n'importe laquelle des 2 cibles).
// ============================================================================

function pointsEgaux(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Marquage EN DIRECT d'un marqueur isolé — vrai s'il coïncide avec L'UNE des 2 cibles (jamais une
 * garantie de correspondance globale correcte, seulement un indicateur visuel par marqueur ; la
 * vérification finale reste `verifierTrace`, tout ou rien sur la paire). */
export function pointCorrespondAUneCible(point: Point, cible1: Point, cible2: Point): boolean {
  return pointsEgaux(point, cible1) || pointsEgaux(point, cible2);
}

export function verifierTrace(cible1: Point, cible2: Point, soumis1: Point, soumis2: Point): boolean {
  return (
    (pointsEgaux(soumis1, cible1) && pointsEgaux(soumis2, cible2)) ||
    (pointsEgaux(soumis1, cible2) && pointsEgaux(soumis2, cible1))
  );
}
