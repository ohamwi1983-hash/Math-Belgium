/**
 * Croquis SCHÉMATIQUE d'un triangle quelconque — coordonnées pixel FIXES, jamais à l'échelle
 * numérique réelle du triangle généré (même philosophie que `ParabolaSketch`/`AllureSketch`/
 * `SketchAxeSommet`/`CercleTrigSketch` : un schéma générique, pas un dessin proportionné). Partagé
 * par les générateurs "triangle" du chapitre 3 (loi des sinus, loi des cosinus, aire, problèmes
 * contextualisés — et le futur générateur 6) : un seul triangle de référence (A en haut, B en bas
 * à gauche, C en bas à droite), jamais reconstruit indépendamment par générateur.
 *
 * `a` (BC) est toujours le côté du bas, `b` (AC) le côté de droite, `c` (AB) le côté de gauche —
 * convention standard (`core/triangle.types.ts`). Les noms de sommet (A/B/C) sont TOUJOURS
 * affichés (décoration fixe) ; `valeurs` fournit, en plus, le texte affiché près de chaque côté/
 * angle (une longueur, un angle en degrés, ou "?" pour une inconnue) — `null`/absent n'affiche
 * rien à cet endroit (ex. un élément qui n'est pas pertinent pour l'écran courant).
 */

export interface PointTriangleSketch {
  x: number;
  y: number;
}

export interface TriangleSketchValeurs {
  a?: string | null;
  b?: string | null;
  c?: string | null;
  angA?: string | null;
  angB?: string | null;
  angC?: string | null;
}

export interface TriangleSketchGeometrie {
  largeur: number;
  hauteur: number;
  sommets: { A: PointTriangleSketch; B: PointTriangleSketch; C: PointTriangleSketch };
  labelSommet: { A: PointTriangleSketch; B: PointTriangleSketch; C: PointTriangleSketch };
  labelCote: { a: PointTriangleSketch; b: PointTriangleSketch; c: PointTriangleSketch };
  labelAngle: { A: PointTriangleSketch; B: PointTriangleSketch; C: PointTriangleSketch };
  valeurs: TriangleSketchValeurs;
}

const LARGEUR = 260;
const HAUTEUR = 220;

const SOMMET_A: PointTriangleSketch = { x: 130, y: 24 };
const SOMMET_B: PointTriangleSketch = { x: 24, y: 196 };
const SOMMET_C: PointTriangleSketch = { x: 236, y: 196 };

function milieu(p1: PointTriangleSketch, p2: PointTriangleSketch): PointTriangleSketch {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/** Déplace `point` le long de l'axe (centroïde → point) : distance>0 s'éloigne du centroïde
 * (labels de côté, à l'extérieur), distance<0 s'en rapproche (labels d'angle, à l'intérieur). */
function decaleDepuisCentroide(point: PointTriangleSketch, centroide: PointTriangleSketch, distance: number): PointTriangleSketch {
  const dx = point.x - centroide.x;
  const dy = point.y - centroide.y;
  const norme = Math.hypot(dx, dy) || 1;
  return { x: point.x + (dx / norme) * distance, y: point.y + (dy / norme) * distance };
}

const DECALAGE_LABEL_SOMMET = 16;
const DECALAGE_LABEL_COTE = 18;
const DECALAGE_LABEL_ANGLE = -28;

export function calculerTriangleSketch(valeurs: TriangleSketchValeurs = {}): TriangleSketchGeometrie {
  const centroide: PointTriangleSketch = {
    x: (SOMMET_A.x + SOMMET_B.x + SOMMET_C.x) / 3,
    y: (SOMMET_A.y + SOMMET_B.y + SOMMET_C.y) / 3,
  };

  return {
    largeur: LARGEUR,
    hauteur: HAUTEUR,
    sommets: { A: SOMMET_A, B: SOMMET_B, C: SOMMET_C },
    labelSommet: {
      A: decaleDepuisCentroide(SOMMET_A, centroide, DECALAGE_LABEL_SOMMET),
      B: decaleDepuisCentroide(SOMMET_B, centroide, DECALAGE_LABEL_SOMMET),
      C: decaleDepuisCentroide(SOMMET_C, centroide, DECALAGE_LABEL_SOMMET),
    },
    labelCote: {
      a: decaleDepuisCentroide(milieu(SOMMET_B, SOMMET_C), centroide, DECALAGE_LABEL_COTE),
      b: decaleDepuisCentroide(milieu(SOMMET_A, SOMMET_C), centroide, DECALAGE_LABEL_COTE),
      c: decaleDepuisCentroide(milieu(SOMMET_A, SOMMET_B), centroide, DECALAGE_LABEL_COTE),
    },
    labelAngle: {
      A: decaleDepuisCentroide(SOMMET_A, centroide, DECALAGE_LABEL_ANGLE),
      B: decaleDepuisCentroide(SOMMET_B, centroide, DECALAGE_LABEL_ANGLE),
      C: decaleDepuisCentroide(SOMMET_C, centroide, DECALAGE_LABEL_ANGLE),
    },
    valeurs,
  };
}
