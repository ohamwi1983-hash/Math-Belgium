import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  additionner3D,
  distance3D,
  EPSILON_3D,
  intersectionDeuxDroites3D,
  multiplierScalaire3D,
  normalePlan,
  normeCarree3D,
  pointAppartientAuPlan,
  produitScalaire3D,
  produitVectoriel3D,
  sontParalleles3D,
  soustraire3D,
} from "../solide3D/geometrieEspace";

/**
 * Géométrie de gen101 (« Positions de deux plans et de trois plans ») — Couche A, vérité terrain
 * calculée depuis les coordonnées internes du solide (`generateurs/solide3D/`), jamais montrée à
 * l'élève. Énumération DÉTERMINISTE (aucun `Math.random` ici) et mise en cache par solide : le tirage
 * sous graine (`genererAvecCode`) redonne donc la même instance que le cache soit déjà rempli ou non.
 *
 * - Points disponibles : les sommets et les milieux de toutes les arêtes (un milieu ne reçoit un nom,
 *   I, J ou K, que s'il sert à nommer un plan de l'instance).
 * - Plans : tous les plans passant par au moins 3 points disponibles non alignés, dédupliqués.
 * - Lisibilité sur le croquis : même projection cavalière et même cadre 400 × 320 (marge 36 px) que
 *   `ui/solide3DSketch.ts`, recopiés ici en quelques lignes (la Couche A ne dépend jamais de la
 *   présentation — même choix que `sectionPlaneSolide/polygoneSection.ts`).
 */

export interface PointDispo {
  cle: string;
  position: Point3D;
  sommet: string | null;
  milieuDe: [string, string] | null;
}

export interface PlanGeo {
  index: number;
  trois: [Point3D, Point3D, Point3D];
  normale: Point3D;
  /** Points disponibles appartenant au plan (au moins 3). */
  contenus: PointDispo[];
}

export interface DonneesSolide {
  solide: Solide3D;
  points: PointDispo[];
  plans: PlanGeo[];
  /** Plan de chaque face (3 premiers sommets). */
  faces: [Point3D, Point3D, Point3D][];
  cadre: CadrePixel;
}

// --- Projection et cadre du croquis ------------------------------------------------------------

const LARGEUR = 400;
const HAUTEUR = 320;
const MARGE = 36;
const K_OBLIQUE = 0.5 * Math.SQRT1_2;

export interface Point2D {
  x: number;
  y: number;
}

export interface CadrePixel {
  minX: number;
  minY: number;
  echelle: number;
  dx: number;
  dy: number;
}

function projeter(p: Point3D): Point2D {
  return { x: p.x + p.y * K_OBLIQUE, y: p.z + p.y * K_OBLIQUE };
}

function calculerCadre(solide: Solide3D): CadrePixel {
  const pts = Object.values(solide.sommets).map(projeter);
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const zl = LARGEUR - 2 * MARGE;
  const zh = HAUTEUR - 2 * MARGE;
  const echelle = Math.min(zl / l, zh / h);
  return { minX, minY, echelle, dx: MARGE + (zl - l * echelle) / 2, dy: MARGE + (zh - h * echelle) / 2 };
}

export function pixel(cadre: CadrePixel, p: Point3D): Point2D {
  const q = projeter(p);
  return { x: cadre.dx + (q.x - cadre.minX) * cadre.echelle, y: HAUTEUR - cadre.dy - (q.y - cadre.minY) * cadre.echelle };
}

/** Le point projeté tombe dans le cadre du croquis, à `marge` px des bords au moins. */
export function pixelDansCadre(p: Point2D, marge = 14): boolean {
  return p.x >= marge && p.x <= LARGEUR - marge && p.y >= marge && p.y <= HAUTEUR - marge;
}

export function distancePixel(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Intersection des droites projetées (a1a2) et (b1b2), `null` si parallèles à l'écran. */
export function intersection2D(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Point2D | null {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const det = d1x * d2y - d1y * d2x;
  if (Math.abs(det) < 1e-9) return null;
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / det;
  return { x: a1.x + d1x * t, y: a1.y + d1y * t };
}

/** Angle (degrés, 0–90) entre deux droites projetées. */
export function angleProjete(u: Point3D, v: Point3D): number {
  const pu = projeter(u);
  const pv = projeter(v);
  const nu = Math.hypot(pu.x, pu.y);
  const nv = Math.hypot(pv.x, pv.y);
  if (nu < 1e-9 || nv < 1e-9) return 0;
  const cos = Math.abs(pu.x * pv.x + pu.y * pv.y) / (nu * nv);
  return (Math.acos(Math.min(1, cos)) * 180) / Math.PI;
}

// --- Énumération --------------------------------------------------------------------------------

export function aretesSolide(solide: Solide3D): [string, string][] {
  const vues = new Set<string>();
  const aretes: [string, string][] = [];
  for (const face of solide.faces) {
    for (let i = 0; i < face.length; i++) {
      const [a, b] = [face[i]!, face[(i + 1) % face.length]!].sort();
      const cle = `${a}${b}`;
      if (vues.has(cle)) continue;
      vues.add(cle);
      aretes.push([a!, b!]);
    }
  }
  return aretes;
}

function pointsDisponibles(solide: Solide3D): PointDispo[] {
  const sommets: PointDispo[] = Object.entries(solide.sommets).map(([nom, position]) => ({ cle: nom, position, sommet: nom, milieuDe: null }));
  const milieux: PointDispo[] = aretesSolide(solide).map(([a, b]) => ({
    cle: `m${a}${b}`,
    position: multiplierScalaire3D(additionner3D(solide.sommets[a]!, solide.sommets[b]!), 0.5),
    sommet: null,
    milieuDe: [a, b],
  }));
  return [...sommets, ...milieux];
}

export function nonAlignes(a: Point3D, b: Point3D, c: Point3D): boolean {
  return normeCarree3D(normalePlan(a, b, c)) > EPSILON_3D;
}

function enumererPlans(points: PointDispo[]): PlanGeo[] {
  const vus = new Set<string>();
  const plans: PlanGeo[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const trois: [Point3D, Point3D, Point3D] = [points[i]!.position, points[j]!.position, points[k]!.position];
        if (!nonAlignes(...trois)) continue;
        const contenus = points.filter((p) => pointAppartientAuPlan(p.position, trois));
        const cle = contenus.map((p) => p.cle).join(",");
        if (vus.has(cle)) continue;
        vus.add(cle);
        plans.push({ index: plans.length, trois, normale: normalePlan(...trois), contenus });
      }
    }
  }
  return plans;
}

const CACHE = new Map<string, DonneesSolide>();

export function donneesSolide(solide: Solide3D): DonneesSolide {
  let d = CACHE.get(solide.id);
  if (!d) {
    const points = pointsDisponibles(solide);
    d = {
      solide,
      points,
      plans: enumererPlans(points),
      faces: solide.faces.map((f) => [solide.sommets[f[0]!]!, solide.sommets[f[1]!]!, solide.sommets[f[2]!]!]),
      cadre: calculerCadre(solide),
    };
    CACHE.set(solide.id, d);
  }
  return d;
}

// --- Relations entre plans et droites ------------------------------------------------------------

export function plansParalleles(p: PlanGeo, q: PlanGeo): boolean {
  return sontParalleles3D(p.normale, q.normale);
}

export function memePlan(p: PlanGeo, q: PlanGeo): boolean {
  return plansParalleles(p, q) && pointAppartientAuPlan(q.trois[0], p.trois);
}

export function dansPlan(point: Point3D, plan: [Point3D, Point3D, Point3D]): boolean {
  return pointAppartientAuPlan(point, plan);
}

export function droiteDansPlan(a: Point3D, b: Point3D, plan: [Point3D, Point3D, Point3D]): boolean {
  return pointAppartientAuPlan(a, plan) && pointAppartientAuPlan(b, plan);
}

export type RelationDroitePlan = "incluse" | "parallele" | "secante";

export function relationDroitePlan(a: Point3D, b: Point3D, plan: [Point3D, Point3D, Point3D]): RelationDroitePlan {
  if (droiteDansPlan(a, b, plan)) return "incluse";
  const n = normalePlan(...plan);
  return Math.abs(produitScalaire3D(n, soustraire3D(b, a))) < EPSILON_3D ? "parallele" : "secante";
}

/** Même droite (a1a2) = (b1b2). */
export function memeDroite(a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D): boolean {
  const d = soustraire3D(a2, a1);
  return sontParalleles3D(d, soustraire3D(b2, b1)) && (distance3D(b1, a1) < EPSILON_3D || sontParalleles3D(d, soustraire3D(b1, a1)));
}

export function droitesParalleles(a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D): boolean {
  return sontParalleles3D(soustraire3D(a2, a1), soustraire3D(b2, b1));
}

/** Point d'intersection de deux droites coplanaires non parallèles, `null` sinon (gauches,
 * parallèles ou confondues). */
export function intersectionDroites(a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D): Point3D | null {
  if (droitesParalleles(a1, a2, b1, b2)) return null;
  return intersectionDeuxDroites3D([a1, a2], [b1, b2]);
}

/** Direction de la droite d'intersection de deux plans non parallèles. */
export function directionIntersection(p: PlanGeo, q: PlanGeo): Point3D {
  return produitVectoriel3D(p.normale, q.normale);
}

/** Les trois normales sont indépendantes (les trois plans ont un seul point commun). */
export function normalesIndependantes(p: PlanGeo, q: PlanGeo, r: PlanGeo): boolean {
  return Math.abs(produitScalaire3D(produitVectoriel3D(p.normale, q.normale), r.normale)) > EPSILON_3D;
}

/** Point commun aux trois plans (normales indépendantes). */
export function pointCommunTroisPlans(p: PlanGeo, q: PlanGeo, r: PlanGeo): Point3D {
  const n1 = p.normale;
  const n2 = q.normale;
  const n3 = r.normale;
  const d1 = produitScalaire3D(n1, p.trois[0]);
  const d2 = produitScalaire3D(n2, q.trois[0]);
  const d3 = produitScalaire3D(n3, r.trois[0]);
  const det = produitScalaire3D(n1, produitVectoriel3D(n2, n3));
  const somme = additionner3D(
    additionner3D(multiplierScalaire3D(produitVectoriel3D(n2, n3), d1), multiplierScalaire3D(produitVectoriel3D(n3, n1), d2)),
    multiplierScalaire3D(produitVectoriel3D(n1, n2), d3),
  );
  return multiplierScalaire3D(somme, 1 / det);
}

/** La droite p ∩ q (p, q non parallèles) rencontre-t-elle le solide (convexe), bord compris ? */
export function intersectionRencontreSolide(d: DonneesSolide, p: PlanGeo, q: PlanGeo): boolean {
  const u = directionIntersection(p, q);
  const n1 = p.normale;
  const n2 = q.normale;
  const d1 = produitScalaire3D(n1, p.trois[0]);
  const d2 = produitScalaire3D(n2, q.trois[0]);
  const x0 = multiplierScalaire3D(additionner3D(multiplierScalaire3D(produitVectoriel3D(n2, u), d1), multiplierScalaire3D(produitVectoriel3D(u, n1), d2)), 1 / produitScalaire3D(u, u));
  const sommets = Object.values(d.solide.sommets);
  const centre = multiplierScalaire3D(sommets.reduce((s, x) => additionner3D(s, x), { x: 0, y: 0, z: 0 }), 1 / sommets.length);
  let bas = -Infinity;
  let haut = Infinity;
  for (const face of d.faces) {
    let n = normalePlan(...face);
    if (produitScalaire3D(n, soustraire3D(centre, face[0])) > 0) n = multiplierScalaire3D(n, -1);
    const f0 = produitScalaire3D(n, soustraire3D(x0, face[0]));
    const s = produitScalaire3D(n, u);
    if (Math.abs(s) < EPSILON_3D) {
      if (f0 > EPSILON_3D) return false;
      continue;
    }
    const t = -f0 / s;
    if (s > 0) haut = Math.min(haut, t);
    else bas = Math.max(bas, t);
  }
  return haut >= bas - EPSILON_3D;
}

function croix(o: Point2D, a: Point2D, b: Point2D): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsSeCoupent(a: Point2D, b: Point2D, c: Point2D, e: Point2D): boolean {
  return croix(c, e, a) * croix(c, e, b) <= 0 && croix(a, b, c) * croix(a, b, e) <= 0;
}

function dansTriangle(p: Point2D, t: Point2D[]): boolean {
  const s = [croix(t[0]!, t[1]!, p), croix(t[1]!, t[2]!, p), croix(t[2]!, t[0]!, p)];
  return s.every((v) => v >= -1e-9) || s.every((v) => v <= 1e-9);
}

/** Les deux triangles (déjà projetés) se touchent-ils SUR LE DESSIN ? */
export function trianglesSeTouchent2D(a: Point2D[], b: Point2D[]): boolean {
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (segmentsSeCoupent(a[i]!, a[(i + 1) % 3]!, b[j]!, b[(j + 1) % 3]!)) return true;
  return dansTriangle(a[0]!, b) || dansTriangle(b[0]!, a);
}
