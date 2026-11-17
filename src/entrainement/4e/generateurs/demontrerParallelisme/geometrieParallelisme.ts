import type { Point3D } from "../../core/geometrieEspace.types";
import type { NatureQuadrilatere, TypeRaisonParallele } from "../../core/demontrerParallelisme.types";
import { additionner3D, multiplierScalaire3D, normalePlan, produitScalaire3D, soustraire3D } from "../solide3D/geometrieEspace";
import { aretesSolide, distancePixel, droitesParalleles, nonAlignes, pixel, type DonneesSolide, type PlanGeo, type Point2D, type PointDispo } from "../positionsPlans/geometriePlans";

/**
 * Géométrie de gen103 (« Démontrer un parallélisme ») — Couche A, vérité terrain calculée depuis les
 * coordonnées internes du solide, jamais montrée. Réutilise l'énumération de gen101
 * (`positionsPlans/geometriePlans.ts` : points disponibles = sommets + milieux d'arêtes, plans par
 * 3 de ces points) et y ajoute le catalogue des parallélismes que l'élève sait JUSTIFIER à ce niveau :
 *
 * - `quad` : côtés opposés d'un parallélogramme dont les 4 sommets sont des sommets du solide (une
 *   face, ou un plan diagonal du cube : « BDHF est un rectangle », exemple du cours) ;
 * - `milieux` : droite des milieux du triangle XYZ (milieux de deux arêtes [XY] et [XZ] issues d'un
 *   même sommet) — parallèle à (YZ) ;
 * - `milieuxParallelogramme` : droite qui joint les milieux de deux côtés opposés d'un parallélogramme
 *   (côtés qui sont des arêtes) — parallèle aux deux autres côtés.
 *
 * Énumération DÉTERMINISTE (aucun `Math.random`), mise en cache par solide : le tirage sous graine
 * (`genererAvecCode`) redonne la même instance que le cache soit rempli ou non.
 */

export interface FaitParallele {
  type: TypeRaisonParallele;
  d1: [PointDispo, PointDispo];
  d2: [PointDispo, PointDispo];
  /** Sommets de la figure : quadrilatère (ordre cyclique) ou triangle [X, Y, Z]. */
  figure: string[];
  nature: NatureQuadrilatere | null;
  /** `milieuxParallelogramme` : les deux côtés coupés en leur milieu. */
  cotes: [[string, string], [string, string]] | null;
}

function cleMilieu(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `m${x}${y}`;
}

/** Ordre cyclique de 4 points coplanaires (angle autour du centre, dans une base du plan). */
function ordreCyclique(points: PointDispo[]): PointDispo[] {
  const centre = multiplierScalaire3D(points.reduce((s, p) => additionner3D(s, p.position), { x: 0, y: 0, z: 0 } as Point3D), 1 / points.length);
  const n = normalePlan(points[0]!.position, points[1]!.position, points[2]!.position);
  const u = soustraire3D(points[0]!.position, centre);
  const v = { x: n.y * u.z - n.z * u.y, y: n.z * u.x - n.x * u.z, z: n.x * u.y - n.y * u.x };
  return points
    .map((p) => {
      const w = soustraire3D(p.position, centre);
      return { p, angle: Math.atan2(produitScalaire3D(w, v), produitScalaire3D(w, u)) };
    })
    .sort((a, b) => a.angle - b.angle)
    .map((x) => x.p);
}

/** Nom usuel d'un polygone : commence par la plus petite lettre, dans le sens où la suivante est la
 * plus petite (ABFE plutôt que AEFB, BDHF plutôt que BFHD). */
export function nomCyclique(noms: string[]): string[] {
  const debut = noms.indexOf([...noms].sort()[0]!);
  const tourne = [...noms.slice(debut), ...noms.slice(0, debut)];
  const inverse = [tourne[0]!, ...tourne.slice(1).reverse()];
  return tourne[1]! < inverse[1]! ? tourne : inverse;
}

function nature(q: PointDispo[]): NatureQuadrilatere {
  const [a, b, , d] = q.map((p) => p.position) as [Point3D, Point3D, Point3D, Point3D];
  const ab = soustraire3D(b, a);
  const ad = soustraire3D(d, a);
  if (Math.abs(produitScalaire3D(ab, ad)) > 1e-6) return "parallélogramme";
  return Math.abs(produitScalaire3D(ab, ab) - produitScalaire3D(ad, ad)) < 1e-6 ? "carré" : "rectangle";
}

const CACHE = new Map<string, FaitParallele[]>();

export function faitsSolide(d: DonneesSolide): FaitParallele[] {
  const cache = CACHE.get(d.solide.id);
  if (cache) return cache;
  const faits: FaitParallele[] = [];
  const parCle = new Map(d.points.map((p) => [p.cle, p]));
  const aretes = new Set(aretesSolide(d.solide).map(([a, b]) => cleMilieu(a, b)));
  const estArete = (a: string, b: string) => aretes.has(cleMilieu(a, b));
  const pt = (nom: string) => parCle.get(nom)!;

  // Parallélogrammes de 4 sommets (faces, plans diagonaux).
  const vus = new Set<string>();
  for (const plan of d.plans) {
    const sommets = plan.contenus.filter((p) => p.sommet);
    if (sommets.length !== 4) continue;
    const cle = sommets.map((p) => p.cle).sort().join("");
    if (vus.has(cle)) continue;
    vus.add(cle);
    const q = ordreCyclique(sommets);
    const [a, b, c, e] = q as [PointDispo, PointDispo, PointDispo, PointDispo];
    const para = (p1: PointDispo, p2: PointDispo, p3: PointDispo, p4: PointDispo) => droitesParalleles(p1.position, p2.position, p3.position, p4.position);
    if (!para(a, b, c, e) || !para(b, c, e, a)) continue;
    const nat = nature(q);
    const figure = nomCyclique(q.map((p) => p.sommet!));
    faits.push({ type: "quad", d1: [a, b], d2: [e, c], figure, nature: nat, cotes: null });
    faits.push({ type: "quad", d1: [b, c], d2: [a, e], figure, nature: nat, cotes: null });
    // Milieux de deux côtés opposés (côtés qui sont des arêtes) : parallèle aux deux autres côtés.
    for (const [[p1, p2], [p3, p4], autres] of [
      [[a, b], [e, c], [[b, c], [a, e]]],
      [[b, c], [a, e], [[a, b], [e, c]]],
    ] as [[PointDispo, PointDispo], [PointDispo, PointDispo], [PointDispo, PointDispo][]][]) {
      if (!estArete(p1.cle, p2.cle) || !estArete(p3.cle, p4.cle)) continue;
      const m1 = pt(cleMilieu(p1.cle, p2.cle));
      const m2 = pt(cleMilieu(p3.cle, p4.cle));
      for (const cote of autres) {
        faits.push({ type: "milieuxParallelogramme", d1: [m1, m2], d2: cote, figure, nature: nat, cotes: [[p1.sommet!, p2.sommet!], [p3.sommet!, p4.sommet!]] });
      }
    }
  }

  // Droite des milieux : milieux de deux arêtes issues d'un même sommet.
  const noms = Object.keys(d.solide.sommets).sort();
  for (const x of noms) {
    const voisins = noms.filter((y) => y !== x && estArete(x, y));
    for (let i = 0; i < voisins.length; i++) {
      for (let j = i + 1; j < voisins.length; j++) {
        const y = voisins[i]!;
        const z = voisins[j]!;
        faits.push({ type: "milieux", d1: [pt(cleMilieu(x, y)), pt(cleMilieu(x, z))], d2: [pt(y), pt(z)], figure: [x, y, z], nature: null, cotes: null });
      }
    }
  }
  CACHE.set(d.solide.id, faits);
  return faits;
}

/** Les deux droites (a1a2), (b1b2) sont-elles les deux droites du fait (dans un sens ou l'autre) ? */
export function memesDroitesQueFait(f: FaitParallele, l: [Point3D, Point3D], m: [Point3D, Point3D], memeDroite: (a1: Point3D, a2: Point3D, b1: Point3D, b2: Point3D) => boolean): boolean {
  const [d1a, d1b] = [f.d1[0].position, f.d1[1].position];
  const [d2a, d2b] = [f.d2[0].position, f.d2[1].position];
  return (memeDroite(l[0], l[1], d1a, d1b) && memeDroite(m[0], m[1], d2a, d2b)) || (memeDroite(l[0], l[1], d2a, d2b) && memeDroite(m[0], m[1], d1a, d1b));
}

// --- Triangles de nommage lisibles -------------------------------------------------------------------

export type Triangle = [PointDispo, PointDispo, PointDispo];

const COTE_MIN_PX = 34;
const AIRE_MIN_PX = 1100;
const ANGLE_MIN_DEG = 16;

function angleEnPx(a: Point2D, b: Point2D, c: Point2D): number {
  const u = { x: b.x - a.x, y: b.y - a.y };
  const v = { x: c.x - a.x, y: c.y - a.y };
  const cos = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

const CACHE_TRIANGLES = new Map<string, Triangle[]>();

/**
 * Triangles de points d'un plan utilisables pour le nommer — mêmes critères de lisibilité que gen101
 * (`positionsPlans/index.ts::trianglesLisibles` : côtés ≥ 34 px, aire ≥ 1 100 px², angles ≥ 16° sur
 * le croquis 400 × 320), mais jusqu'à TROIS milieux : le plan des milieux de trois arêtes (tétraèdre,
 * pyramide, plan médian d'un cube ou d'un prisme) est un classique du parallélisme de deux plans.
 */
export function trianglesNommage(d: DonneesSolide, plan: PlanGeo): Triangle[] {
  const cle = `${d.solide.id}#${plan.index}`;
  let liste = CACHE_TRIANGLES.get(cle);
  if (liste) return liste;
  liste = [];
  const c = plan.contenus;
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) {
      for (let k = j + 1; k < c.length; k++) {
        const t: Triangle = [c[i]!, c[j]!, c[k]!];
        if (!nonAlignes(t[0].position, t[1].position, t[2].position)) continue;
        const [a, b, e] = t.map((p) => pixel(d.cadre, p.position)) as [Point2D, Point2D, Point2D];
        if (Math.min(distancePixel(a, b), distancePixel(b, e), distancePixel(a, e)) < COTE_MIN_PX) continue;
        const aire = Math.abs((b.x - a.x) * (e.y - a.y) - (e.x - a.x) * (b.y - a.y)) / 2;
        if (aire < AIRE_MIN_PX) continue;
        if (Math.min(angleEnPx(a, b, e), angleEnPx(b, a, e), angleEnPx(e, a, b)) < ANGLE_MIN_DEG) continue;
        liste.push(t);
      }
    }
  }
  CACHE_TRIANGLES.set(cle, liste);
  return liste;
}

export function plansNommage(d: DonneesSolide): PlanGeo[] {
  return d.plans.filter((p) => trianglesNommage(d, p).length > 0);
}

/** Triangle tiré en favorisant les sommets : 0, 1, 2 ou 3 milieux ont les poids 16, 4, 2, 1. */
export function tirerTriangle(liste: Triangle[], aleatoire: () => number = Math.random): Triangle {
  const poids = liste.map((t) => [16, 4, 2, 1][t.filter((p) => p.milieuDe).length]!);
  const total = poids.reduce((s, p) => s + p, 0);
  let r = aleatoire() * total;
  for (let i = 0; i < liste.length; i++) {
    r -= poids[i]!;
    if (r <= 0) return liste[i]!;
  }
  return liste[liste.length - 1]!;
}
