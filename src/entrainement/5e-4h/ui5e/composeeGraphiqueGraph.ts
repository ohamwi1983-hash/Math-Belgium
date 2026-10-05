import type { CourbeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";

/** Segments consécutifs de la ligne brisée — un tableau de paires [pointA,pointB], jamais un seul
 * `Plot.OfX` (les courbes de 5gen4 sont des lignes brisées, pas une fonction algébrique lisse — voir
 * `core5e/composeeGraphique.types.ts`). Conservée pour les tests/autres usages éventuels du modèle
 * de DONNÉES brut — le RENDU visuel utilise désormais `pointsLissesCourbe` (voir plus bas, E.6). */
export function segmentsCourbe(courbe: CourbeGraphique): [PointGraphique, PointGraphique][] {
  const segments: [PointGraphique, PointGraphique][] = [];
  for (let i = 0; i < courbe.points.length - 1; i++) {
    segments.push([courbe.points[i], courbe.points[i + 1]]);
  }
  return segments;
}

export function extremitesCourbe(courbe: CourbeGraphique): [PointGraphique, PointGraphique] {
  return [courbe.points[0], courbe.points[courbe.points.length - 1]];
}

/** Nombre de points interpolés par intervalle [x,x+1] entre 2 nœuds consécutifs — assez dense pour
 * une allure visuellement lisse sur le cadre 320px/17 nœuds de `CourbeGraph.tsx`. */
const ECHANTILLONS_PAR_SEGMENT = 14;

/** Spline de Catmull-Rom uniforme (composante par composante, x et y) — passe EXACTEMENT par p1 en
 * t=0 et p2 en t=1, p0/p3 servant de points de contrôle voisins (dupliqués aux extrémités de la
 * courbe pour rester bien défini). Formule standard, cross-vérifiée par test aux bornes t=0/t=1. */
function catmullRom(p0: PointGraphique, p1: PointGraphique, p2: PointGraphique, p3: PointGraphique, t: number): PointGraphique {
  const t2 = t * t;
  const t3 = t2 * t;
  const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return { x, y };
}

/**
 * Points DENSÉMENT interpolés (spline de Catmull-Rom) passant EXACTEMENT par chaque nœud de la
 * ligne brisée — remplace `segmentsCourbe` pour le RENDU visuel uniquement (E.6,
 * `promptcorrectionsregroupees.md` : "courbe lisse continue... pas une interpolation linéaire par
 * segments... allure de polygone des effectifs"). Le MODÈLE DE DONNÉES reste inchangé (ligne brisée
 * à nœuds de grille entiers, voir `core5e/composeeGraphique.types.ts`) — la spline interpole
 * seulement l'AFFICHAGE entre les mêmes nœuds, jamais les nœuds eux-mêmes : chaque question de
 * l'exercice continue de porter sur une abscisse entière dont l'image reste EXACTEMENT celle du
 * nœud d'origine, propriété centrale de ce générateur ("toutes les coordonnées interrogées tombent
 * sur des nœuds de grille entiers"). Écart assumé par rapport à la lettre du prompt ("catalogue de
 * fonctions de référence" façon gen10, 4e) — voir `core5e/composeeGraphique.types.ts` pour la preuve
 * que cette famille de fonctions est structurellement incompatible avec cette contrainte ; ce
 * lissage cible directement le symptôme visuel décrit (angles vifs façon polygone) sans jamais
 * sacrifier l'exactitude des réponses.
 */
export function pointsLissesCourbe(courbe: CourbeGraphique): PointGraphique[] {
  const pts = courbe.points;
  if (pts.length < 2) return pts;
  const resultat: PointGraphique[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < ECHANTILLONS_PAR_SEGMENT; s++) {
      resultat.push(catmullRom(p0, p1, p2, p3, s / ECHANTILLONS_PAR_SEGMENT));
    }
  }
  resultat.push(pts[pts.length - 1]);
  return resultat;
}
