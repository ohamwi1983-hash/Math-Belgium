/**
 * Couche A — "Équation d'un cercle (non développée) à partir d'un graphe". 2 variantes qui
 * différencient réellement la compétence exercée (jamais un simple habillage) : `rayon_direct`
 * (le point marqué est aligné avec le centre — rayon lu directement en comptant les carreaux) et
 * `rayon_indirect` (le point marqué est décalé en diagonale — rayon retrouvé par la formule de
 * distance, jamais lisible directement sur la grille).
 *
 * Cadrage lisible (audit chapitre 7, points 41 et 43) : centre dans [−4 ; 4]², rayon ≤ 6 pour
 * `rayon_direct`, écarts |dx|, |dy| ≤ 5 pour `rayon_indirect` — la figure tient dans environ 24
 * unités, ce qui permet un quadrillage de pas 1 (chaque coordonnée entière se lit sur un nœud).
 * Pour `rayon_indirect`, R² = dx² + dy² est toujours entier mais R est le plus souvent irrationnel
 * (√13, √20…) : c'est R² qui entre dans l'équation, exactement comme dans le cours.
 */
import type { ExerciceEquationCercle, VarianteEquationCercle } from "../../core/equationCercle.types";
import type { Point } from "../../core/vecteur.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function signeAleatoire(): 1 | -1 {
  return Math.random() < 0.5 ? -1 : 1;
}

const BORNE_CENTRE = 4;
const RAYON_DIRECT_MIN = 2;
const RAYON_DIRECT_MAX = 6;
const ECART_INDIRECT_MAX = 5;

function tirerCentre(): Point {
  return { x: randomInt(-BORNE_CENTRE, BORNE_CENTRE), y: randomInt(-BORNE_CENTRE, BORNE_CENTRE) };
}

interface DonneesCercle {
  centre: Point;
  rayonCarre: number;
  pointMarque: Point;
}

/** Le point marqué est aligné sur l'un des 2 axes passant par le centre — le rayon se lit alors
 * directement en comptant les carreaux, sans aucun calcul. */
function construireRayonDirect(): DonneesCercle {
  const centre = tirerCentre();
  const rayon = randomInt(RAYON_DIRECT_MIN, RAYON_DIRECT_MAX);
  const horizontal = Math.random() < 0.5;
  const signe = signeAleatoire();
  const pointMarque: Point = horizontal ? { x: centre.x + signe * rayon, y: centre.y } : { x: centre.x, y: centre.y + signe * rayon };
  return { centre, rayonCarre: rayon * rayon, pointMarque };
}

/** Le point marqué est décalé simultanément en x ET en y (écarts entiers, jamais nuls — contrainte
 * `promptgen49gen50modifications.md`, partie A.2 : `pointMarque.x !== centre.x` ET
 * `pointMarque.y !== centre.y`) : jamais alignable directement sur la grille, le rayon se retrouve
 * par la distance centre↔point, R² = dx² + dy². */
function construireRayonIndirect(): DonneesCercle {
  const centre = tirerCentre();
  const dx = signeAleatoire() * randomInt(1, ECART_INDIRECT_MAX);
  const dy = signeAleatoire() * randomInt(1, ECART_INDIRECT_MAX);
  const pointMarque: Point = { x: centre.x + dx, y: centre.y + dy };
  return { centre, rayonCarre: dx * dx + dy * dy, pointMarque };
}

export function construireExercice(variante: VarianteEquationCercle): ExerciceEquationCercle {
  const { centre, rayonCarre, pointMarque } = variante === "rayon_direct" ? construireRayonDirect() : construireRayonIndirect();
  return { variante, centre, rayonCarre, rayon: Math.sqrt(rayonCarre), pointMarque };
}

export const CATALOGUE_VARIANTES: { id: VarianteEquationCercle; label: string }[] = [
  { id: "rayon_direct", label: "Rayon lu directement sur la grille" },
  { id: "rayon_indirect", label: "Rayon retrouvé par la distance (Pythagore)" },
];

export function construireAvecVarianteId(varianteId: VarianteEquationCercle): ExerciceEquationCercle {
  return construireExercice(varianteId);
}

export function genererExerciceEquationCercle(): ExerciceEquationCercle {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
