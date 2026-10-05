import type { CourbeGraphique } from "../../core5e/composeeGraphique.types";
import { choisirParmi, entierAleatoire } from "../domaineDefinition/aleatoire";

/** Cadre visible commun aux 2 courbes — 17×17 nœuds de grille. */
export const X_MIN_CADRE = -8;
export const X_MAX_CADRE = 8;
export const Y_MIN_CADRE = -8;
export const Y_MAX_CADRE = 8;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Ligne brisée jagged passant par un nœud de grille entier à CHAQUE abscisse entière de
 * `[xMin,xMax]` — jamais une famille algébrique lisse (voir en-tête de `core5e/composeeGraphique.types.ts`
 * pour la justification) : chaque pas fait varier y d'un delta borné, clampé au cadre visible. */
export function genererCourbeJagged(xMin: number, xMax: number, yDepart: number, amplitude = 3): CourbeGraphique {
  const points = [{ x: xMin, y: clamp(yDepart, Y_MIN_CADRE, Y_MAX_CADRE) }];
  for (let x = xMin + 1; x <= xMax; x++) {
    const yPrecedent = points[points.length - 1].y;
    const y = clamp(yPrecedent + entierAleatoire(-amplitude, amplitude), Y_MIN_CADRE, Y_MAX_CADRE);
    points.push({ x, y });
  }
  return { points };
}

export type FormeDomaine = "gauche" | "droite" | "interieur";

/** Domaine d'une courbe RESTREINTE : soit une demi-droite visuelle (ancrée à un bord du cadre),
 * soit un intervalle strictement intérieur — longueur 5 à 9 nœuds, toujours strictement plus
 * courte que le cadre complet (17 nœuds). */
export function genererDomaineRestreint(): [number, number] {
  const longueur = entierAleatoire(5, 9);
  const forme: FormeDomaine = choisirParmi(["gauche", "droite", "interieur"]);
  if (forme === "gauche") return [X_MIN_CADRE, X_MIN_CADRE + longueur - 1];
  if (forme === "droite") return [X_MAX_CADRE - longueur + 1, X_MAX_CADRE];
  const debut = entierAleatoire(X_MIN_CADRE + 1, X_MAX_CADRE - longueur - 1);
  return [debut, debut + longueur - 1];
}

/** Domaine (bornes inf/sup) d'une courbe — les 2 bornes extrêmes de sa liste de points, déjà
 * triée par x croissant à la construction. */
export function domaineCourbe(courbe: CourbeGraphique): [number, number] {
  return [courbe.points[0].x, courbe.points[courbe.points.length - 1].x];
}

export function imageCourbe(courbe: CourbeGraphique, x: number): number | null {
  const point = courbe.points.find((p) => p.x === x);
  return point ? point.y : null;
}
