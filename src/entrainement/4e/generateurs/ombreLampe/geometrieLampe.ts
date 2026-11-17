import type { Point3D } from "../../core/geometrieEspace.types";
import { projeter2D } from "../ombreSoleil/ombreGeometrie";

/**
 * Couche A — géométrie de la projection CENTRALE de gen106 (« Ombre à la lampe »). Tous les rayons
 * partent de la lampe L ; l'ombre d'un point S (plus bas que L) sur le sol est le point de la droite
 * (LS) d'altitude 0. Les helpers « image » travaillent sur le dessin en perspective cavalière (même
 * projection que `ombreSoleil/ombreGeometrie.ts::projeter2D`, en unités projetées) : un point du
 * dessin correspond à UN point du sol (ou d'un mur frontal), ce qui sert à construire les leurres
 * « sur le dessin, il est sur le rayon » sans y être dans l'espace.
 */

const K = Math.cos(Math.PI / 4) * 0.5;

export interface Point2DUnites {
  x: number;
  y: number;
}

/** Ombre au sol du point `s` éclairé par la lampe `lampe` (`s.z < lampe.z`). */
export function ombreParLampe(lampe: Point3D, s: Point3D): Point3D {
  const t = lampe.z / (lampe.z - s.z);
  return { x: lampe.x + t * (s.x - lampe.x), y: lampe.y + t * (s.y - lampe.y), z: 0 };
}

/** Point du sol (z = 0) dont l'image sur le dessin est `q`. */
export function solDepuisImage(q: Point2DUnites): Point3D {
  return { x: q.x - q.y, y: q.y / K, z: 0 };
}

/** Point du mur frontal y = `yMur` dont l'image sur le dessin est `q`. */
export function murDepuisImage(q: Point2DUnites, yMur: number): Point3D {
  return { x: q.x - K * yMur, y: yMur, z: q.y - K * yMur };
}

/** Point du sol qui a la même image que `p` sur le dessin. */
export function imageSurSol(p: Point3D): Point3D {
  return solDepuisImage(projeter2D(p));
}

/** Vecteur du sol dont l'image sur le dessin a la direction `d`. */
export function directionSolDepuisImage(d: Point2DUnites): Point3D {
  return { x: d.x - d.y, y: d.y / K, z: 0 };
}

/** Intersection, SUR LE DESSIN, des images des droites (a1a2) et (b1b2) ; `null` si presque parallèles. */
export function intersectionImages(a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D): Point2DUnites | null {
  const p = projeter2D(a1);
  const r = { x: projeter2D(a2).x - p.x, y: projeter2D(a2).y - p.y };
  const q = projeter2D(b1);
  const s = { x: projeter2D(b2).x - q.x, y: projeter2D(b2).y - q.y };
  const den = r.x * s.y - r.y * s.x;
  if (Math.abs(den) < 1e-9 * Math.hypot(r.x, r.y) * Math.hypot(s.x, s.y) || Math.abs(den) < 1e-12) return null;
  const t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / den;
  return { x: p.x + t * r.x, y: p.y + t * r.y };
}

/** Paramètre t tel que l'image de `p` vaut image(a) + t·(image(b) − image(a)) (projection orthogonale
 * sur le dessin). */
export function parametreSurImage(p: Point3D, a: Point3D, b: Point3D): number {
  const P = projeter2D(p);
  const A = projeter2D(a);
  const B = projeter2D(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  return ((P.x - A.x) * dx + (P.y - A.y) * dy) / (dx * dx + dy * dy || 1);
}

/** Angle (degrés, dans [0 ; 180]) entre deux vecteurs du sol, dans l'espace. */
export function angleSol(u: Point3D, v: Point3D): number {
  const c = (u.x * v.x + u.y * v.y) / ((Math.hypot(u.x, u.y) || 1) * (Math.hypot(v.x, v.y) || 1));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/** Enveloppe convexe 2D (chaîne monotone d'Andrew, sens trigonométrique). */
export function enveloppe2D<T extends Point2DUnites>(points: readonly T[]): T[] {
  const tries = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const produit = (o: T, a: T, b: T) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const bas: T[] = [];
  for (const p of tries) {
    while (bas.length >= 2 && produit(bas[bas.length - 2], bas[bas.length - 1], p) <= 1e-9) bas.pop();
    bas.push(p);
  }
  const haut: T[] = [];
  for (const p of [...tries].reverse()) {
    while (haut.length >= 2 && produit(haut[haut.length - 2], haut[haut.length - 1], p) <= 1e-9) haut.pop();
    haut.push(p);
  }
  return [...bas.slice(0, -1), ...haut.slice(0, -1)];
}

/** Le point `p` tombe-t-il, sur le dessin, dans l'enveloppe des images de `points` élargie de
 * `marge` unité projetée (une marge négative la rétrécit) ? */
export function dansDessin(p: Point3D, points: readonly Point3D[], marge = 0): boolean {
  return testeurDessin(points)(p, marge);
}

/** Même test que `dansDessin`, l'enveloppe des `points` étant calculée une seule fois. */
export function testeurDessin(points: readonly Point3D[]): (p: Point3D, marge?: number) => boolean {
  const enveloppe = enveloppe2D(points.map(projeter2D));
  return (p, marge = 0) => {
    const q = projeter2D(p);
    for (let i = 0; i < enveloppe.length; i++) {
      const a = enveloppe[i];
      const b = enveloppe[(i + 1) % enveloppe.length];
      const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      if (((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x)) / longueur < -marge) return false;
    }
    return true;
  };
}

/** Distance (pixels) d'un point au segment [a, b], sur le dessin. */
export function distancePixelSegment(p: Point3D, a: Point3D, b: Point3D, echelle: number): number {
  const P = projeter2D(p);
  const A = projeter2D(a);
  const B = projeter2D(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const t = Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(P.x - (A.x + t * dx), P.y - (A.y + t * dy)) * echelle;
}
