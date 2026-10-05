/**
 * Couche présentation — géométrie pure du croquis SVG sur mesure de "Triangles liés" (retrofit
 * `promptretrofitsvggen58.md`, remplace l'ancien rendu Mafs — voir CLAUDE.md pour le principe
 * général "Mafs vs SVG sur mesure"). Contrairement à `TriangleSketch`/`TriangleQuelconqueSketch`
 * (croquis SCHÉMATIQUES à sommets fixes), la géométrie ici reste PROPORTIONNELLEMENT FIDÈLE aux
 * valeurs réellement générées pour l'instance (`exercice.points`, coordonnées réelles déjà
 * calculées en Couche A) : `calculerCroquisTriangleLies` applique une SIMILITUDE (échelle UNIFORME
 * en x/y, jamais déformée) pour faire tenir cette géométrie dans un cadre pixel fixe — un angle de
 * 26° généré reste visuellement un angle de 26° à l'écran, contrairement à un rendu Mafs dont le
 * ratio d'aspect peut être ajusté indépendamment sur x/y (voir `ajusterAuRatio`, jamais utilisé ici).
 */
import type { ExerciceTriangleLies } from "../core/triangleLies.types";

export const LARGEUR_CROQUIS = 280;
export const HAUTEUR_CROQUIS = 240;

/** Marge réservée entre la géométrie ajustée à l'échelle et le bord du cadre — assez généreuse
 * pour que le décalage de label (`DECALAGE_LABEL`) reste presque toujours entièrement à l'intérieur
 * sans avoir besoin du clampage ci-dessous (qui reste un filet, jamais le seul mécanisme). */
const MARGE_GEOMETRIE = 42;
const DECALAGE_LABEL = 14;
/** Distance minimale entre un label et le bord du cadre — filet de robustesse ABSOLU : quelle que
 * soit la configuration de points (y compris un point déjà extrémal après ajustement à l'échelle),
 * un label ne peut jamais sortir du viewBox. C'est ce clampage qui corrige structurellement le bug
 * du point T sans label (voir CLAUDE.md) : jamais un simple espoir que la marge suffise. */
const INSET_LABEL = 10;

export interface PointCroquisTriangleLies {
  nom: string;
  point: { x: number; y: number };
  label: { x: number; y: number };
}

function clamp(valeur: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valeur));
}

/**
 * Calcule les positions PIXEL (point + label, tous deux garantis dans le cadre `LARGEUR_CROQUIS ×
 * HAUTEUR_CROQUIS`) de chaque point nommé de l'exercice, à partir de ses coordonnées réelles
 * (`exercice.points`). Échelle UNIFORME (similitude, jamais x/y indépendants) centrée sur la
 * bounding box réelle, axe Y inversé (le repère de Couche A a Y croissant vers le haut, SVG vers le
 * bas). Chaque label est décalé radialement depuis le centroïde PIXEL de tous les points (même
 * principe que `decaleDepuisCentroide`, `ui/triangleSketch.ts`), puis clampé dans le cadre.
 */
export function calculerCroquisTriangleLies(exercice: ExerciceTriangleLies): PointCroquisTriangleLies[] {
  const xs = exercice.points.map((p) => p.x);
  const ys = exercice.points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const largeurReelle = Math.max(xMax - xMin, 1e-6);
  const hauteurReelle = Math.max(yMax - yMin, 1e-6);

  const echelle = Math.min((LARGEUR_CROQUIS - 2 * MARGE_GEOMETRIE) / largeurReelle, (HAUTEUR_CROQUIS - 2 * MARGE_GEOMETRIE) / hauteurReelle);
  const centreReel = { x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 };
  const centrePixel = { x: LARGEUR_CROQUIS / 2, y: HAUTEUR_CROQUIS / 2 };

  const points = exercice.points.map((p) => ({
    nom: p.nom,
    point: {
      x: centrePixel.x + (p.x - centreReel.x) * echelle,
      y: centrePixel.y - (p.y - centreReel.y) * echelle,
    },
  }));

  const centroidePixel = {
    x: points.reduce((somme, p) => somme + p.point.x, 0) / points.length,
    y: points.reduce((somme, p) => somme + p.point.y, 0) / points.length,
  };

  return points.map(({ nom, point }) => {
    const dx = point.x - centroidePixel.x;
    const dy = point.y - centroidePixel.y;
    const norme = Math.hypot(dx, dy) || 1;
    const labelBrut = { x: point.x + (dx / norme) * DECALAGE_LABEL, y: point.y + (dy / norme) * DECALAGE_LABEL };
    return {
      nom,
      point,
      label: {
        x: clamp(labelBrut.x, INSET_LABEL, LARGEUR_CROQUIS - INSET_LABEL),
        y: clamp(labelBrut.y, INSET_LABEL, HAUTEUR_CROQUIS - INSET_LABEL),
      },
    };
  });
}

function cleSegment(segment: readonly [string, string]): string {
  return [...segment].sort().join("|");
}

/** Le côté TRANSFÉRÉ apparaît toujours comme un segment littéralement partagé (même paire de noms
 * de points, ordre indifférent) entre `segmentsPont` et `segmentsCible` — vérifié par construction
 * pour les 4 familles (voir `generateurs/triangleLies/familles/*.ts`). `null` seulement en théorie
 * (jamais atteint en pratique, filet de robustesse). */
export function segmentPartage(exercice: ExerciceTriangleLies): [string, string] | null {
  const clesCible = new Set(exercice.segmentsCible.map(cleSegment));
  return exercice.segmentsPont.find((s) => clesCible.has(cleSegment(s))) ?? null;
}
