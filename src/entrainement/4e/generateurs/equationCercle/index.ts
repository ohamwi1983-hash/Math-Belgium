/**
 * Couche A — "Équation d'un cercle (non développée) à partir d'un graphe". 2 variantes qui
 * différencient réellement la compétence exercée (jamais un simple habillage) : `rayon_direct`
 * (le point marqué est aligné avec le centre — rayon lu directement en comptant les carreaux) et
 * `rayon_indirect` (le point marqué est décalé en diagonale — rayon retrouvé par la formule de
 * distance, jamais lisible directement sur la grille).
 *
 * Exactitude par construction — triplet pythagoricien (même principe que "Norme d'un vecteur et
 * distance entre 2 points"/"Distance point-droite et droite-droite") : pour `rayon_indirect`, le
 * décalage (dx,dy) est toujours l'une des jambes d'un triplet pythagoricien exact, garantissant un
 * rayon toujours entier — jamais une tolérance sur une distance irrationnelle.
 */
import type { ExerciceEquationCercle, VarianteEquationCercle } from "../../core/equationCercle.types";
import type { Point } from "../../core/vecteur.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Triplets pythagoriciens "propres" — même liste que "Norme d'un vecteur et distance entre 2
 * points"/"Distance point-droite et droite-droite", dupliquée ici (contrats indépendants entre
 * générateurs, même principe de duplication assumée qu'ailleurs dans le projet). */
const TRIPLETS_PYTHAGORICIENS: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];

const BORNE_CENTRE = 4;

function tirerCentre(): Point {
  return { x: randomInt(-BORNE_CENTRE, BORNE_CENTRE), y: randomInt(-BORNE_CENTRE, BORNE_CENTRE) };
}

interface DonneesCercle {
  centre: Point;
  rayon: number;
  pointMarque: Point;
}

/** Le point marqué est aligné sur l'un des 2 axes passant par le centre — le rayon se lit alors
 * directement en comptant les carreaux, sans aucun calcul. */
function construireRayonDirect(): DonneesCercle {
  const centre = tirerCentre();
  const rayon = randomInt(2, 8);
  const horizontal = Math.random() < 0.5;
  const signe = Math.random() < 0.5 ? -1 : 1;
  const pointMarque: Point = horizontal ? { x: centre.x + signe * rayon, y: centre.y } : { x: centre.x, y: centre.y + signe * rayon };
  return { centre, rayon, pointMarque };
}

/** Le point marqué est décalé simultanément en x ET en y — jamais alignable directement sur la
 * grille, le rayon doit être retrouvé par la distance centre↔point (triplet pythagoricien exact).
 * Contrainte vérifiée (`promptgen49gen50modifications.md`, partie A.2) : `pointMarque.x !== centre.x`
 * ET `pointMarque.y !== centre.y` pour toute instance — déjà garanti mathématiquement ici, jamais
 * seulement probable, puisque `a`/`b` (les jambes du triplet pythagoricien) sont toujours des
 * entiers strictement positifs dans `TRIPLETS_PYTHAGORICIENS` (jamais 0) : `dx = signeX·a` et
 * `dy = signeY·b` ne peuvent donc jamais s'annuler, quel que soit le signe tiré. Déjà verrouillé par
 * `index.test.ts` (`pointMarque.x`/`.y` explicitement différents de `centre.x`/`.y`, 500 tirages) —
 * aucun changement de génération nécessaire pour cette variante. Ne concerne QUE `rayon_indirect` :
 * `rayon_direct` reste, par construction, TOUJOURS aligné sur un axe (voir `construireRayonDirect`
 * ci-dessus) — c'est précisément ce qui distingue les deux variantes, jamais touché par cette
 * contrainte. */
function construireRayonIndirect(): DonneesCercle {
  const centre = tirerCentre();
  const [a, b, rayon] = TRIPLETS_PYTHAGORICIENS[randomInt(0, TRIPLETS_PYTHAGORICIENS.length - 1)]!;
  const signeX = Math.random() < 0.5 ? -1 : 1;
  const signeY = Math.random() < 0.5 ? -1 : 1;
  const pointMarque: Point = { x: centre.x + signeX * a, y: centre.y + signeY * b };
  return { centre, rayon, pointMarque };
}

export function construireExercice(variante: VarianteEquationCercle): ExerciceEquationCercle {
  const donnees = variante === "rayon_direct" ? construireRayonDirect() : construireRayonIndirect();
  return { variante, ...donnees };
}

export const CATALOGUE_VARIANTES: { id: VarianteEquationCercle; label: string }[] = [
  { id: "rayon_direct", label: "Rayon lu directement sur la grille" },
  { id: "rayon_indirect", label: "Rayon retrouvé par la distance (triplet pythagoricien)" },
];

export function construireAvecVarianteId(varianteId: VarianteEquationCercle): ExerciceEquationCercle {
  return construireExercice(varianteId);
}

export function genererExerciceEquationCercle(): ExerciceEquationCercle {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
