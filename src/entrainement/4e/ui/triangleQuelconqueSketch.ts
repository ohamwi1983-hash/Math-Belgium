/**
 * Croquis riche de "Triangle quelconque" (chapitre 3, remplace "Aire d'un triangle quelconque" à la
 * position 19, `promptcreationgenerateur19trianglequelconque.md`) — étend le croquis schématique
 * partagé (`triangleSketch.ts`, réutilisé TEL QUEL pour la géométrie de base : sommets, côtés,
 * labels de sommet/valeur) avec un surlignage de côtés/angles et des connecteurs de paire
 * côté–angle-opposé, factorisé ici pour rester réutilisable par d'éventuels futurs générateurs sur
 * les triangles quelconques (ex. le futur générateur SSA ambigu, en attente d'une session de
 * conception dédiée). Nouveau composant, distinct du croquis de cercle trigonométrique déjà
 * factorisé pour "Quel angle ?"/"Angles associés" (`CercleTrigBase`) — jamais réutilisé ici, comme
 * demandé explicitement par le prompt de création.
 *
 * Un angle surligné est un secteur en POLYGONE PLEIN (le sommet + deux points à distance fixe le
 * long de chaque côté adjacent) plutôt qu'un arc SVG — même choix que les autres croquis à secteur
 * du projet (ex. les quarts de disque de `cercleQuadrantSelecteur.ts`) : un polygone à 3 points n'a
 * aucune ambiguïté de sweep-flag, contrairement à un arc circulaire.
 *
 * Un connecteur de paire côté–angle-opposé relie le MILIEU du côté à son sommet opposé (le sommet
 * où vit l'angle correspondant — côté `a`=BC est TOUJOURS opposé au sommet A, `SOMMET_OPPOSE` est
 * donc une simple table fixe, jamais un calcul) — un segment médian schématique, suffisant pour ce
 * croquis, jamais une flèche complexe à calculer.
 */
import type { CoteTriangle, SommetTriangle } from "../core/triangle.types";
import type { PointTriangleSketch, TriangleSketchGeometrie, TriangleSketchValeurs } from "./triangleSketch";
import { calculerTriangleSketch } from "./triangleSketch";

/** Réexporté pour compatibilité des appelants existants — alias direct de `CoteTriangle` (`core/triangle.types.ts`). */
export type LettreCoteTriangle = CoteTriangle;

export interface SegmentSketch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SecteurAngleSketch {
  sommet: SommetTriangle;
  chemin: string;
}

export interface TriangleQuelconqueSketchOptions {
  /** Côtés dont le tracé est surligné (ex. les données connues, ou les deux côtés de la formule d'aire). */
  cotesSurlignes?: LettreCoteTriangle[];
  /** Angles dont le sommet reçoit un secteur surligné (même principe). */
  anglesSurlignes?: SommetTriangle[];
  /** Côtés dont la paire "côté ↔ angle opposé" est reliée visuellement (connecteur médian). */
  paires?: LettreCoteTriangle[];
}

export interface TriangleQuelconqueSketchGeometrie {
  base: TriangleSketchGeometrie;
  cotesSurlignes: SegmentSketch[];
  anglesSurlignes: SecteurAngleSketch[];
  connecteurs: SegmentSketch[];
}

const DISTANCE_SECTEUR = 34;

function milieuSketch(p1: PointTriangleSketch, p2: PointTriangleSketch): PointTriangleSketch {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function pointVersDirection(depart: PointTriangleSketch, vers: PointTriangleSketch, distance: number): PointTriangleSketch {
  const dx = vers.x - depart.x;
  const dy = vers.y - depart.y;
  const norme = Math.hypot(dx, dy) || 1;
  return { x: depart.x + (dx / norme) * distance, y: depart.y + (dy / norme) * distance };
}

/** Les deux sommets adjacents à un côté (ex. "a"=BC → B,C — convention standard, triangle.types.ts). */
const SOMMETS_ADJACENTS_COTE: Record<LettreCoteTriangle, [SommetTriangle, SommetTriangle]> = {
  a: ["B", "C"],
  b: ["A", "C"],
  c: ["A", "B"],
};
const SOMMET_OPPOSE: Record<LettreCoteTriangle, SommetTriangle> = { a: "A", b: "B", c: "C" };

/** Les deux sommets adjacents à un angle donné (les deux côtés qui forment le secteur à ce sommet). */
const SOMMETS_ADJACENTS_ANGLE: Record<SommetTriangle, [SommetTriangle, SommetTriangle]> = {
  A: ["B", "C"],
  B: ["A", "C"],
  C: ["A", "B"],
};

export function calculerTriangleQuelconqueSketch(
  valeurs: TriangleSketchValeurs = {},
  options: TriangleQuelconqueSketchOptions = {},
): TriangleQuelconqueSketchGeometrie {
  const base = calculerTriangleSketch(valeurs);
  const { sommets } = base;

  const cotesSurlignes: SegmentSketch[] = (options.cotesSurlignes ?? []).map((lettre) => {
    const [s1, s2] = SOMMETS_ADJACENTS_COTE[lettre];
    return { x1: sommets[s1].x, y1: sommets[s1].y, x2: sommets[s2].x, y2: sommets[s2].y };
  });

  const anglesSurlignes: SecteurAngleSketch[] = (options.anglesSurlignes ?? []).map((sommet) => {
    const [voisin1, voisin2] = SOMMETS_ADJACENTS_ANGLE[sommet];
    const s = sommets[sommet];
    const q1 = pointVersDirection(s, sommets[voisin1], DISTANCE_SECTEUR);
    const q2 = pointVersDirection(s, sommets[voisin2], DISTANCE_SECTEUR);
    return { sommet, chemin: `${s.x},${s.y} ${q1.x},${q1.y} ${q2.x},${q2.y}` };
  });

  const connecteurs: SegmentSketch[] = (options.paires ?? []).map((cote) => {
    const [s1, s2] = SOMMETS_ADJACENTS_COTE[cote];
    const milieu = milieuSketch(sommets[s1], sommets[s2]);
    const oppose = sommets[SOMMET_OPPOSE[cote]];
    return { x1: milieu.x, y1: milieu.y, x2: oppose.x, y2: oppose.y };
  });

  return { base, cotesSurlignes, anglesSurlignes, connecteurs };
}
