import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  AxeBoite,
  DonneesFacesParalleles,
  DonneesPointDirection,
  ExerciceIntersectionParallele,
  PointNommeIntersection,
  VarianteIntersectionParallele,
} from "../../core/intersectionParallele.types";
import { normalePlan, pointAppartientAuPlan, produitScalaire3D, produitVectoriel3D, normeCarree3D, soustraire3D } from "../solide3D/geometrieEspace";
import { projeterPoint3D } from "../../ui/projectionCavaliere";
import { intersectionPixels } from "../../ui/figurePercee";
import { choisir, melanger } from "../../ui/outilsAnalytiqueLotG";
import { candidatsEcran3 } from "../../ui/formatIntersectionParallele";

/**
 * Générateur de gen134 « Intersection de deux plans par parallélisme » (4e, ch. 8, § 5 et § 8).
 * Tout le hasard passe par `Math.random` (`genererAvecCode` : le QR code rouvre le MÊME exercice).
 *
 * Solide : cube (arête 4) ou pavé ABCDEFGH (arêtes 4 ou 6) ; `axe` = direction perpendiculaire aux
 * deux faces étudiées F0 (axe = 0) et F1 (face opposée) — ABCD / EFGH, ABFE / DCGH ou ADHE / BCGF,
 * au tiers. Repère local (u ; v) dans ces faces, coordonnées entières.
 * - `faces-paralleles` : P et Q à l'intérieur de deux arêtes différentes de F0, (PQ) oblique ; R à
 *   l'intérieur d'une arête de F1, jamais au-dessus de P ou de Q (la parallèle serait une simple
 *   translation de [PQ]) ; la parallèle à (PQ) menée par R ressort de F1 en S, à l'intérieur d'une
 *   AUTRE arête, à au moins 1,5 unité de R.
 * - `point-direction` : les traces des deux plans dans F0 joignent des sommets ou des MILIEUX d'arêtes
 *   (deux milieux au plus : « I est le milieu de [EH], J celui de [FG] ») et se coupent en K à
 *   l'intérieur de F0, sous un angle d'au moins 25° ; chaque plan est nommé par trois des quatre
 *   sommets de sa section.
 */

export const CATALOGUE_VARIANTES: { id: VarianteIntersectionParallele; label: string }[] = [
  { id: "faces-paralleles", label: "Plans parallèles coupés par un troisième" },
  { id: "point-direction", label: "Un point commun et une direction" },
];

const EPS = 1e-6;
type UV = { u: number; v: number };

function boite(l: number, p: number, h: number): Solide3D {
  return {
    id: l === p && p === h ? "cube" : "pave",
    label: l === p && p === h ? "Cube ABCDEFGH" : "Pavé droit ABCDEFGH",
    sommets: {
      A: { x: 0, y: 0, z: 0 },
      B: { x: l, y: 0, z: 0 },
      C: { x: l, y: p, z: 0 },
      D: { x: 0, y: p, z: 0 },
      E: { x: 0, y: 0, z: h },
      F: { x: l, y: 0, z: h },
      G: { x: l, y: p, z: h },
      H: { x: 0, y: p, z: h },
    },
    faces: [
      ["A", "B", "F", "E"],
      ["D", "C", "G", "H"],
      ["A", "B", "C", "D"],
      ["E", "F", "G", "H"],
      ["A", "D", "H", "E"],
      ["B", "C", "G", "F"],
    ],
  };
}

export interface Repere {
  U: number;
  V: number;
  W: number;
  vers3D: (q: UV, w: number) => Point3D;
}

export function repere(axe: AxeBoite, dims: { l: number; p: number; h: number }): Repere {
  if (axe === "x") return { U: dims.p, V: dims.h, W: dims.l, vers3D: (q, w) => ({ x: w, y: q.u, z: q.v }) };
  if (axe === "y") return { U: dims.l, V: dims.h, W: dims.p, vers3D: (q, w) => ({ x: q.u, y: w, z: q.v }) };
  return { U: dims.l, V: dims.p, W: dims.h, vers3D: (q, w) => ({ x: q.u, y: q.v, z: w }) };
}

export function nomSommet(s: Solide3D, p: Point3D): string | null {
  for (const [n, q] of Object.entries(s.sommets)) if (Math.abs(q.x - p.x) + Math.abs(q.y - p.y) + Math.abs(q.z - p.z) < EPS) return n;
  return null;
}

function cotes(q: UV, r: Repere): number[] {
  const c: number[] = [];
  if (Math.abs(q.v) < EPS) c.push(0);
  if (Math.abs(q.u - r.U) < EPS) c.push(1);
  if (Math.abs(q.v - r.V) < EPS) c.push(2);
  if (Math.abs(q.u) < EPS) c.push(3);
  return c;
}

const COINS = (r: Repere): UV[] => [
  { u: 0, v: 0 },
  { u: r.U, v: 0 },
  { u: r.U, v: r.V },
  { u: 0, v: r.V },
];

/** Arête (noms des deux sommets, ordre alphabétique) qui porte le côté `cote` de la face w. */
function areteDuCote(s: Solide3D, r: Repere, cote: number, w: number): [string, string] {
  const c = COINS(r);
  const a = nomSommet(s, r.vers3D(c[cote]!, w))!;
  const b = nomSommet(s, r.vers3D(c[(cote + 1) % 4]!, w))!;
  return [a, b].sort() as [string, string];
}

export function faceNommee(s: Solide3D, r: Repere, w: number): string[] {
  return COINS(r).map((c) => nomSommet(s, r.vers3D(c, w))!);
}

/** Second point où la droite q + t·d (dans le rectangle) rencontre le bord. */
function sortieRectangle(q: UV, d: UV, r: Repere): { point: UV; t: number } | null {
  const ts: number[] = [];
  if (Math.abs(d.u) > EPS) ts.push(-q.u / d.u, (r.U - q.u) / d.u);
  if (Math.abs(d.v) > EPS) ts.push(-q.v / d.v, (r.V - q.v) / d.v);
  for (const t of ts) {
    if (Math.abs(t) < EPS) continue;
    const p = { u: q.u + t * d.u, v: q.v + t * d.v };
    if (p.u > -EPS && p.u < r.U + EPS && p.v > -EPS && p.v < r.V + EPS) return { point: p, t };
  }
  return null;
}

const estCoin = (q: UV, r: Repere) => cotes(q, r).length >= 2;

function tirerDims(): { l: number; p: number; h: number } {
  if (Math.random() < 0.5) return { l: 4, p: 4, h: 4 };
  for (;;) {
    const l = choisir([4, 6]);
    const h = choisir([4, 6]);
    if (l !== 4 || h !== 4) return { l, p: 4, h };
  }
}

function base(variante: VarianteIntersectionParallele) {
  const dims = tirerDims();
  const solide = boite(dims.l, dims.p, dims.h);
  const axe = choisir<AxeBoite>(["x", "y", "z"]);
  const r = repere(axe, dims);
  return { variante, dims, solide, axe, r, genre: (solide.id === "cube" ? "cube" : "pave") as "cube" | "pave" };
}

// --- Plans parallèles coupés par un troisième -----------------------------------------------------

function pointInterieurCote(r: Repere, cote: number): UV {
  const longueur = cote % 2 === 0 ? r.U : r.V;
  const k = 1 + Math.floor(Math.random() * (longueur - 1));
  const c = COINS(r)[cote]!;
  const c2 = COINS(r)[(cote + 1) % 4]!;
  return { u: c.u + ((c2.u - c.u) * k) / longueur, v: c.v + ((c2.v - c.v) * k) / longueur };
}

function genererFacesParalleles(): ExerciceIntersectionParallele {
  for (;;) {
    const { variante, dims, solide, axe, r, genre } = base("faces-paralleles");
    const [cp, cq] = melanger([0, 1, 2, 3]).slice(0, 2) as [number, number];
    const P = pointInterieurCote(r, cp);
    const Q = pointInterieurCote(r, cq);
    const d = { u: Q.u - P.u, v: Q.v - P.v };
    if (Math.abs(d.u) < EPS || Math.abs(d.v) < EPS) continue;
    // [PQ] assez long pour se lire (au moins 2 unités : jamais deux points collés près d'un coin).
    if (Math.hypot(d.u, d.v) < 2) continue;
    const cr = choisir([0, 1, 2, 3]);
    const R = pointInterieurCote(r, cr);
    const memeUV = (a: UV, b: UV) => Math.abs(a.u - b.u) + Math.abs(a.v - b.v) < EPS;
    if (memeUV(R, P) || memeUV(R, Q)) continue;
    const sortie = sortieRectangle(R, d, r);
    if (!sortie) continue;
    const S = sortie.point;
    if (estCoin(S, r)) continue;
    const cs = cotes(S, r)[0]!;
    if (cs === cr) continue;
    if (Math.hypot(S.u - R.u, S.v - R.v) < 1.5) continue;
    const P3 = r.vers3D(P, 0);
    const Q3 = r.vers3D(Q, 0);
    const R3 = r.vers3D(R, r.W);
    const plan: [Point3D, Point3D, Point3D] = [P3, Q3, R3];
    // Triangle PQR lisible sur le dessin (aire projetée d'au moins 3 unités²).
    const [pp, pq, pr] = [P3, Q3, R3].map(projeterPoint3D) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
    if (Math.abs((pq.x - pp.x) * (pr.y - pp.y) - (pq.y - pp.y) * (pr.x - pp.x)) / 2 < 3) continue;
    const face1 = faceNommee(solide, r, r.W);
    const horsPlan = face1.filter((n) => !pointAppartientAuPlan(solide.sommets[n]!, plan));
    if (horsPlan.length === 0) continue;
    const autresCotes = [0, 1, 2, 3].filter((c) => c !== cr && c !== cs);
    const faces: DonneesFacesParalleles = {
      sommetLeurre: choisir(horsPlan),
      pointLeurre: Math.random() < 0.5 ? "P" : "Q",
      areteLeurre: areteDuCote(solide, r, choisir(autresCotes), r.W),
      S: r.vers3D(S, r.W),
      areteS: areteDuCote(solide, r, cs, r.W),
    };
    const points: PointNommeIntersection[] = [
      { nom: "P", position: P3, arete: areteDuCote(solide, r, cp, 0), milieu: false },
      { nom: "Q", position: Q3, arete: areteDuCote(solide, r, cq, 0), milieu: false },
      { nom: "R", position: R3, arete: areteDuCote(solide, r, cr, r.W), milieu: false },
    ];
    const ex: ExerciceIntersectionParallele = { variante, genre, solide, dims, axe, face0: faceNommee(solide, r, 0), face1, points, faces, ordre1: melanger([0, 1, 2, 3]), ordre2: melanger([0, 1, 2, 3]) };
    if (!candidatsEcran3(ex)) continue;
    return ex;
  }
}

// --- Un point commun et une direction --------------------------------------------------------------

function candidatsBord(r: Repere): UV[] {
  return [...COINS(r), { u: r.U / 2, v: 0 }, { u: r.U, v: r.V / 2 }, { u: r.U / 2, v: r.V }, { u: 0, v: r.V / 2 }];
}

function croisentDessin(a: Point3D, b: Point3D, c: Point3D, d: Point3D): boolean {
  const [pa, pb, pc, pd] = [a, b, c, d].map(projeterPoint3D) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  const i = intersectionPixels(pa, pb, pc, pd);
  if (!i) return false;
  const dans = (p: { x: number; y: number }, q: { x: number; y: number }) => {
    const lx = q.x - p.x;
    const ly = q.y - p.y;
    const u = ((i.x - p.x) * lx + (i.y - p.y) * ly) / (lx * lx + ly * ly || 1);
    return u > 0.1 && u < 0.9;
  };
  return dans(pa, pb) && dans(pc, pd);
}

function gauches(a: Point3D, b: Point3D, c: Point3D, d: Point3D): boolean {
  const u = soustraire3D(b, a);
  const v = soustraire3D(d, c);
  const n = produitVectoriel3D(u, v);
  if (normeCarree3D(n) < EPS) return false;
  return Math.abs(produitScalaire3D(n, soustraire3D(c, a))) > EPS;
}

function genererPointDirection(): ExerciceIntersectionParallele {
  for (;;) {
    const { variante, dims, solide, axe, r, genre } = base("point-direction");
    const cand = candidatsBord(r);
    const [b1, c1, b2, c2] = [choisir(cand), choisir(cand), choisir(cand), choisir(cand)];
    const tous = [b1, c1, b2, c2];
    if (new Set(tous.map((q) => `${q.u};${q.v}`)).size < 4) continue;
    const sansCoteCommun = (a: UV, b: UV) => !cotes(a, r).some((c) => cotes(b, r).includes(c));
    if (!sansCoteCommun(b1, c1) || !sansCoteCommun(b2, c2)) continue;
    const milieux = tous.filter((q) => !estCoin(q, r)).length;
    if (milieux > 2) continue;
    // Intersection des deux traces, strictement dans F0.
    const d1 = { u: c1.u - b1.u, v: c1.v - b1.v };
    const d2 = { u: c2.u - b2.u, v: c2.v - b2.v };
    const det = d1.u * d2.v - d1.v * d2.u;
    if (Math.abs(det) < EPS) continue;
    const sinAngle = Math.abs(det) / (Math.hypot(d1.u, d1.v) * Math.hypot(d2.u, d2.v));
    if (sinAngle < Math.sin((25 * Math.PI) / 180)) continue;
    const t = ((b2.u - b1.u) * d2.v - (b2.v - b1.v) * d2.u) / det;
    const s = ((b2.u - b1.u) * d1.v - (b2.v - b1.v) * d1.u) / det;
    if (t < 0.05 || t > 0.95 || s < 0.05 || s > 0.95) continue;
    const K = { u: b1.u + t * d1.u, v: b1.v + t * d1.v };
    // K à au moins une unité du bord de F0 (sinon K, K′ et leurs étiquettes s'entassent près d'une arête).
    if (K.u < 1 || K.u > r.U - 1 || K.v < 1 || K.v > r.V - 1) continue;

    // Noms : sommets, ou milieux I/J et M/N (point de F0, puis son translaté dans F1).
    const points: PointNommeIntersection[] = [];
    const paires = [
      ["I", "J"],
      ["M", "N"],
    ];
    const nomDe = new Map<string, string>();
    const nommer = (q: UV, w: number): string => {
      const p3 = r.vers3D(q, w);
      const sommet = nomSommet(solide, p3);
      if (sommet) return sommet;
      const cle = `${q.u};${q.v};${w}`;
      const deja = nomDe.get(cle);
      if (deja) return deja;
      const k = points.length / 2;
      const [n0, n1] = paires[k]!;
      const cote = cotes(q, r)[0]!;
      const p0 = r.vers3D(q, 0);
      const p1 = r.vers3D(q, r.W);
      points.push({ nom: n0!, position: p0, arete: areteDuCote(solide, r, cote, 0), milieu: true });
      points.push({ nom: n1!, position: p1, arete: areteDuCote(solide, r, cote, r.W), milieu: true });
      nomDe.set(`${q.u};${q.v};0`, n0!);
      nomDe.set(`${q.u};${q.v};${r.W}`, n1!);
      return w === 0 ? n0! : n1!;
    };
    const section = (b: UV, c: UV) => [nommer(b, 0), nommer(c, 0), nommer(c, r.W), nommer(b, r.W)];
    const sec1 = section(b1, c1);
    const sec2 = section(b2, c2);
    const pos = (n: string) => solide.sommets[n] ?? points.find((p) => p.nom === n)!.position;
    const nomPlan = (sec: string[]) => {
      const idx = melanger([0, 1, 2, 3]).slice(0, 3).sort((a, b) => a - b);
      return idx.map((i) => sec[i]!) as [string, string, string];
    };
    const plans: [[string, string, string], [string, string, string]] = [nomPlan(sec1), nomPlan(sec2)];
    const plan3 = (sec: string[]) => [pos(sec[0]!), pos(sec[1]!), pos(sec[2]!)] as [Point3D, Point3D, Point3D];
    const P1 = plan3(sec1);
    const P2 = plan3(sec2);
    // Côté parallèle à l'axe : de préférence une arête (deux sommets).
    const coteAxe = (sec: string[]): [string, string] => {
      const a: [string, string] = [sec[0]!, sec[3]!];
      const b: [string, string] = [sec[1]!, sec[2]!];
      if (solide.sommets[a[0]] && solide.sommets[a[1]]) return a;
      if (solide.sommets[b[0]] && solide.sommets[b[1]]) return b;
      return Math.random() < 0.5 ? a : b;
    };
    const cotesAxe: [[string, string], [string, string]] = [coteAxe(sec1), coteAxe(sec2)];
    const aretesAxe: [string, string][] = COINS(r).map((c) => [nomSommet(solide, r.vers3D(c, 0))!, nomSommet(solide, r.vers3D(c, r.W))!]);
    const areteDansPlan = aretesAxe.find(([a, b]) => cotesAxe.some((c) => (c[0] === a && c[1] === b) || (c[0] === b && c[1] === a)));
    const direction = areteDansPlan ?? aretesAxe[0]!;
    // Leurre de direction : une arête d'une autre direction, dans aucun des deux plans.
    const autres: [string, string][] = [];
    for (const f of solide.faces)
      for (let i = 0; i < 4; i++) {
        const a = f[i]!;
        const b = f[(i + 1) % 4]!;
        const u = soustraire3D(solide.sommets[b]!, solide.sommets[a]!);
        if (Math.abs(u[axe]) > EPS) continue;
        const dansUn = [P1, P2].some((P) => pointAppartientAuPlan(solide.sommets[a]!, P) && pointAppartientAuPlan(solide.sommets[b]!, P));
        if (!dansUn && !autres.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) autres.push([a, b].sort() as [string, string]);
      }
    if (autres.length === 0) continue;
    const seuls = plans[0].filter((n) => !pointAppartientAuPlan(pos(n), P2));
    if (seuls.length === 0) continue;
    // Leurre « croisement » : un côté de chaque section, gauches, qui se croisent sur le dessin.
    const cotesSection = (sec: string[]) => [0, 1, 2, 3].map((i) => [sec[i]!, sec[(i + 1) % 4]!] as [string, string]);
    const croisements: { d1: [string, string]; d2: [string, string] }[] = [];
    for (const x of cotesSection(sec1))
      for (const y of cotesSection(sec2)) {
        const [a, b, c, d] = [pos(x[0]), pos(x[1]), pos(y[0]), pos(y[1])];
        if (gauches(a, b, c, d) && croisentDessin(a, b, c, d)) croisements.push({ d1: x, d2: y });
      }
    const croisement = croisements.length > 0 ? { ...choisir(croisements), dessin: true } : { d1: [sec1[0]!, sec1[1]!] as [string, string], d2: [sec2[3]!, sec2[2]!] as [string, string], dessin: false };
    const donnees: DonneesPointDirection = {
      plans,
      sections: [sec1, sec2],
      traces0: [
        [sec1[0]!, sec1[1]!],
        [sec2[0]!, sec2[1]!],
      ],
      traces1: [
        [sec1[3]!, sec1[2]!],
        [sec2[3]!, sec2[2]!],
      ],
      cotesAxe,
      K: r.vers3D(K, 0),
      K2: r.vers3D(K, r.W),
      direction,
      directionLeurre: choisir(autres),
      croisement,
      pointSeul: choisir(seuls),
    };
    // Contrôle : K et K′ sont bien dans les deux plans.
    if (![donnees.K, donnees.K2].every((k) => pointAppartientAuPlan(k, P1) && pointAppartientAuPlan(k, P2))) continue;
    if (normeCarree3D(produitVectoriel3D(normalePlan(...P1), normalePlan(...P2))) < EPS) continue;
    const ex: ExerciceIntersectionParallele = {
      variante,
      genre,
      solide,
      dims,
      axe,
      face0: faceNommee(solide, r, 0),
      face1: faceNommee(solide, r, r.W),
      points,
      direction: donnees,
      ordre1: melanger([0, 1, 2, 3]),
      ordre2: melanger([0, 1, 2, 3]),
    };
    if (!candidatsEcran3(ex)) continue;
    return ex;
  }
}

export function genererIntersectionParallele(variante: VarianteIntersectionParallele): ExerciceIntersectionParallele {
  return variante === "faces-paralleles" ? genererFacesParalleles() : genererPointDirection();
}

export function construireAvecVariante(id: string): ExerciceIntersectionParallele {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererIntersectionParallele(v.id) : genererExerciceIntersectionParallele();
}

export function genererExerciceIntersectionParallele(): ExerciceIntersectionParallele {
  return genererIntersectionParallele(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
