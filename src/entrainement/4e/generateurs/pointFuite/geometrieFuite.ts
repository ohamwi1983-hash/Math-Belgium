import { HAUTEUR_GRILLE, LARGEUR_GRILLE, type Pt } from "../../core/pointFuite.types";

/**
 * Géométrie plane de gen105 (« Perspective centrale : point de fuite ») : tout se passe sur la vitre,
 * en unités du quadrillage (y vers le haut). Fonctions pures, partagées par le générateur, la figure
 * (`ui/figurePointFuite.ts`) et la construction interactive (`components/ConstructionPointFuite.tsx`).
 */

export const EPS = 1e-9;

/** Point de [p q] (ou de son prolongement) : p + t·(q − p). */
export function sur(p: Pt, q: Pt, t: number): Pt {
  return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
}

export function milieu(p: Pt, q: Pt): Pt {
  return sur(p, q, 0.5);
}

export function distance(p: Pt, q: Pt): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

export function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-7;
}

export function estNoeud(p: Pt): boolean {
  return estEntier(p.x) && estEntier(p.y);
}

/** Intersection des droites (a1a2) et (b1b2), `null` si elles sont parallèles. */
export function intersectionDroites(a1: Pt, a2: Pt, b1: Pt, b2: Pt): Pt | null {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const det = d1x * d2y - d1y * d2x;
  if (Math.abs(det) < EPS) return null;
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / det;
  return { x: a1.x + d1x * t, y: a1.y + d1y * t };
}

/** Paramètre t de p sur (ab) (projection orthogonale). */
export function parametre(a: Pt, b: Pt, p: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  return ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
}

/** Distance de p à la DROITE (ab). */
export function distanceDroite(a: Pt, b: Pt, p: Pt): number {
  const l = distance(a, b) || 1;
  return Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / l;
}

/** Distance de p au SEGMENT [ab]. */
export function distanceSegment(a: Pt, b: Pt, p: Pt): number {
  const t = Math.max(0, Math.min(1, parametre(a, b, p)));
  return distance(sur(a, b, t), p);
}

/** Angle (en degrés, entre 0 et 90) entre les directions de (ab) et (cd). */
export function angleEntre(a: Pt, b: Pt, c: Pt, d: Pt): number {
  const u = Math.atan2(b.y - a.y, b.x - a.x);
  const v = Math.atan2(d.y - c.y, d.x - c.x);
  let diff = Math.abs(u - v) % Math.PI;
  if (diff > Math.PI / 2) diff = Math.PI - diff;
  return (diff * 180) / Math.PI;
}

export function dansCadre(p: Pt, marge = 0): boolean {
  return p.x >= marge - EPS && p.x <= LARGEUR_GRILLE - marge + EPS && p.y >= marge - EPS && p.y <= HAUTEUR_GRILLE - marge + EPS;
}

/** La droite (ab) coupée au cadre [0 ; L] × [0 ; H] (segment visible), `null` si hors cadre. */
export function droiteDansCadre(a: Pt, b: Pt): [Pt, Pt] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let tMin = -1e6;
  let tMax = 1e6;
  for (const [o, d, max] of [
    [a.x, dx, LARGEUR_GRILLE],
    [a.y, dy, HAUTEUR_GRILLE],
  ] as const) {
    if (Math.abs(d) < EPS) {
      if (o < -EPS || o > max + EPS) return null;
      continue;
    }
    const t1 = (0 - o) / d;
    const t2 = (max - o) / d;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (tMax - tMin < EPS) return null;
  return [sur(a, b, tMin), sur(a, b, tMax)];
}

/** Le segment [ab] prolongé du côté de b jusqu'au bord du cadre. */
export function demiDroiteDansCadre(a: Pt, b: Pt): [Pt, Pt] | null {
  const c = droiteDansCadre(a, b);
  if (!c) return null;
  const [p, q] = c;
  return parametre(a, b, p) > parametre(a, b, q) ? [a, p] : [a, q];
}
