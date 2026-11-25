import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  DispositionRealiteIllusion,
  ExerciceRealiteIllusion,
  PointDessinRealite,
  VarianteRealiteIllusion,
  VerdictRealiteIllusion,
} from "../../core/realiteIllusion.types";
import { projeterPoint3D, type Point2D } from "../../ui/projectionCavaliere";
import { calculerAretesAvecVisibilite } from "../../ui/solide3DSketch";
import { cadreEspace } from "../../ui/figureEspaceLotH";
import { intersectionPixels } from "../../ui/figurePercee";
import { choisir, melanger } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen135 « Réalité ou illusion ? » (4e, ch. 8, § 6). Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le MÊME exercice).
 *
 * Ordre des tirages : variante (si libre), VERDICT (à parts égales), puis le dessin.
 * - Base ABC dans le plan horizontal (z = 0), triangle bien ouvert sur le dessin.
 * - `tronc` : sommet S au-dessus (sens « haut ») ou en dessous (sens « bas ») ; D, E, F sur (SA),
 *   (SB), (SC) — le dessus DEF est un plan, les faces latérales aussi : le solide EXISTE. Impossible :
 *   une arête latérale vise un faux sommet T ≠ S (la face latérale n'est plus plane) ; sur le dessin,
 *   les deux autres arêtes se coupent en I, l'arête déplacée les coupe en J et K, triangle IJK net
 *   (hauteurs ≥ 16 px, I à 20 px au moins de l'arête déplacée).
 * - `prisme` : arêtes latérales verticales, hauteurs différentes (prisme coupé par un plan oblique,
 *   le solide existe) ; impossible : une arête penchée d'au moins 12° sur le dessin, qui coupe les deux
 *   autres en J et K (à 24 px au moins l'un de l'autre), du côté des prolongements.
 * Mêmes contrôles de lisibilité pour les deux verdicts : faces latérales convexes sur le dessin, même
 * visibilité des arêtes que le solide de référence, sommets et points écartés, solide assez grand dans
 * le cadre (qui contient dès l'énoncé les prolongements : la figure ne saute pas d'un écran à l'autre).
 */

export const CATALOGUE_VARIANTES: { id: VarianteRealiteIllusion; label: string }[] = [
  { id: "tronc", label: "Solide à arêtes latérales convergentes (tronc de pyramide ?)" },
  { id: "prisme", label: "Solide à arêtes latérales verticales (prisme coupé ?)" },
];

/** Arêtes latérales : base → dessus. */
export const ARETES_LATERALES: [string, string][] = [
  ["A", "D"],
  ["B", "E"],
  ["C", "F"],
];

const alea = (a: number, b: number) => a + Math.random() * (b - a);
const ajouter = (p: Point3D, q: Point3D): Point3D => ({ x: p.x + q.x, y: p.y + q.y, z: p.z + q.z });
const moins = (p: Point3D, q: Point3D): Point3D => ({ x: p.x - q.x, y: p.y - q.y, z: p.z - q.z });
const fois = (p: Point3D, k: number): Point3D => ({ x: p.x * k, y: p.y * k, z: p.z * k });
/** Point du dessin (unités) → point 3D qui se projette exactement sur lui. */
export const versDessin = (q: Point2D): Point3D => ({ x: q.x, y: 0, z: q.y });
const dist2 = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y);

function distanceDroite(p: Point2D, a: Point2D, b: Point2D): number {
  const l = dist2(a, b) || 1;
  return Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / l;
}

/** Paramètre u de p sur (a, b) : p = a + u(b − a). */
function parametre(p: Point2D, a: Point2D, b: Point2D): number {
  const lx = b.x - a.x;
  const ly = b.y - a.y;
  return ((p.x - a.x) * lx + (p.y - a.y) * ly) / (lx * lx + ly * ly || 1);
}

function angleEnDegres(a: Point2D, b: Point2D, c: Point2D): number {
  const u = { x: b.x - a.x, y: b.y - a.y };
  const v = { x: c.x - a.x, y: c.y - a.y };
  const cos = (u.x * v.x + u.y * v.y) / ((Math.hypot(u.x, u.y) || 1) * (Math.hypot(v.x, v.y) || 1));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Base ABC (z = 0) : A est le sommet le plus en avant, puis B et C dans le sens trigonométrique vu de dessus. */
function tirerBase(): [Point3D, Point3D, Point3D] {
  for (;;) {
    const pts: Point3D[] = [0, 1, 2].map(() => ({ x: alea(0, 8), y: alea(0, 9), z: 0 }));
    const d = pts.map(projeterPoint3D) as [Point2D, Point2D, Point2D];
    const aire = Math.abs((d[1].x - d[0].x) * (d[2].y - d[0].y) - (d[1].y - d[0].y) * (d[2].x - d[0].x)) / 2;
    if (aire < 6) continue;
    if (Math.min(dist2(d[0], d[1]), dist2(d[1], d[2]), dist2(d[0], d[2])) < 3) continue;
    if (Math.min(angleEnDegres(d[0], d[1], d[2]), angleEnDegres(d[1], d[0], d[2]), angleEnDegres(d[2], d[0], d[1])) < 22) continue;
    // Base vue de dessus : angles réels pas trop fermés non plus (le solide ne doit pas être une lame).
    if (Math.min(angleEnDegres(pts[0]!, pts[1]!, pts[2]!), angleEnDegres(pts[1]!, pts[0]!, pts[2]!), angleEnDegres(pts[2]!, pts[0]!, pts[1]!)) < 25) continue;
    pts.sort((p, q) => p.y - q.y);
    const A = pts[0]!;
    const [p, q] = [pts[1]!, pts[2]!];
    const ccw = (p.x - A.x) * (q.y - A.y) - (p.y - A.y) * (q.x - A.x) > 0;
    return ccw ? [A, p, q] : [A, q, p];
  }
}

function solideDe(base: Point3D[], dessus: Point3D[]): Solide3D {
  return {
    id: "solide-abcdef",
    label: "Solide ABCDEF",
    sommets: { A: base[0]!, B: base[1]!, C: base[2]!, D: dessus[0]!, E: dessus[1]!, F: dessus[2]! },
    faces: [
      ["A", "B", "C"],
      ["D", "E", "F"],
      ["A", "B", "E", "D"],
      ["B", "C", "F", "E"],
      ["A", "C", "F", "D"],
    ],
  };
}

/** Quadrilatère du dessin convexe et non aplati (côtés tournant tous dans le même sens). */
function convexe(q: Point2D[]): boolean {
  let signe = 0;
  for (let i = 0; i < q.length; i++) {
    const a = q[i]!;
    const b = q[(i + 1) % q.length]!;
    const c = q[(i + 2) % q.length]!;
    const z = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(z) < 0.6) return false;
    const s = Math.sign(z);
    if (signe === 0) signe = s;
    else if (s !== signe) return false;
  }
  return true;
}

const cleVisibilite = (s: Solide3D) =>
  calculerAretesAvecVisibilite(s)
    .map((a) => `${a.sommets.join("")}${a.visible ? "+" : "-"}`)
    .sort()
    .join(" ");

interface Dessin {
  base: Point3D[];
  dessus: Point3D[];
  reference: Point3D[];
  sommet: Point3D | null;
}

function dessinTronc(sens: "haut" | "bas"): Dessin {
  const base = tirerBase();
  const g = fois(ajouter(ajouter(base[0], base[1]), base[2]), 1 / 3);
  const S = sens === "haut" ? ajouter(g, { x: alea(-2, 2), y: alea(-1.5, 1.5), z: alea(10, 15) }) : ajouter(g, { x: alea(-2, 2), y: alea(-1.5, 1.5), z: -alea(6, 9) });
  let ts: number[];
  do ts = sens === "haut" ? [0, 1, 2].map(() => alea(0.35, 0.6)) : [0, 1, 2].map(() => alea(1.45, 1.95));
  while (Math.max(...ts) - Math.min(...ts) > 0.18);
  const dessus = base.map((b, i) => (sens === "haut" ? ajouter(b, fois(moins(S, b), ts[i]!)) : ajouter(S, fois(moins(b, S), ts[i]!))));
  return { base, dessus, reference: dessus, sommet: S };
}

function dessinPrisme(): Dessin {
  const base = tirerBase();
  const dessus = base.map((b) => ajouter(b, { x: 0, y: 0, z: alea(4.5, 8.5) }));
  return { base, dessus, reference: dessus, sommet: null };
}

/** Arête latérale p déplacée : vers un faux sommet (tronc) ou penchée (prisme). */
function deplacer(d: Dessin, variante: VarianteRealiteIllusion, sens: "haut" | "bas", p: number): Point3D[] {
  const b = d.base[p]!;
  const dessus = [...d.dessus];
  if (variante === "tronc") {
    const S = d.sommet!;
    const signe = Math.random() < 0.5 ? -1 : 1;
    const T = ajouter(S, { x: signe * alea(1.5, 4), y: alea(-1.5, 1.5), z: alea(-2, 2) });
    const t = sens === "haut" ? (d.dessus[p]!.z - b.z) / (S.z - b.z) : (d.dessus[p]!.z - S.z) / (b.z - S.z);
    dessus[p] = sens === "haut" ? ajouter(b, fois(moins(T, b), t)) : ajouter(T, fois(moins(b, T), t));
  } else {
    const h = d.dessus[p]!.z - b.z;
    const signe = Math.random() < 0.5 ? -1 : 1;
    dessus[p] = ajouter(b, { x: signe * alea(1, 3.5), y: alea(-1, 1), z: h });
  }
  return dessus;
}

function prolongement(depart: Point2D, dir: Point2D, points: Point2D[], longueurDefaut: number): [Point2D, Point2D] {
  const l = Math.hypot(dir.x, dir.y) || 1;
  const u = { x: dir.x / l, y: dir.y / l };
  const loin = points.length ? Math.max(...points.map((p) => (p.x - depart.x) * u.x + (p.y - depart.y) * u.y)) : longueurDefaut;
  const fin = loin + Math.max(0.6, 0.15 * loin);
  return [depart, { x: depart.x + u.x * fin, y: depart.y + u.y * fin }];
}

function essai(variante: VarianteRealiteIllusion, verdict: VerdictRealiteIllusion): ExerciceRealiteIllusion | null {
  const sens: "haut" | "bas" = variante === "prisme" ? (Math.random() < 0.5 ? "haut" : "bas") : Math.random() < 0.5 ? "haut" : "bas";
  const d = variante === "tronc" ? dessinTronc(sens) : dessinPrisme();
  const p = verdict === "impossible" ? Math.floor(Math.random() * 3) : null;
  const dessus = p === null ? d.dessus : deplacer(d, variante, sens, p);
  const solide = solideDe(d.base, dessus);
  const reference = solideDe(d.base, d.reference);
  if (cleVisibilite(solide) !== cleVisibilite(reference)) return null;

  const B2 = d.base.map(projeterPoint3D);
  const H2 = dessus.map(projeterPoint3D);
  // Faces latérales convexes sur le dessin, dessus non aplati.
  const faces = [
    [B2[0]!, B2[1]!, H2[1]!, H2[0]!],
    [B2[1]!, B2[2]!, H2[2]!, H2[1]!],
    [B2[0]!, B2[2]!, H2[2]!, H2[0]!],
  ];
  if (!faces.every(convexe)) return null;
  const aireDessus = Math.abs((H2[1]!.x - H2[0]!.x) * (H2[2]!.y - H2[0]!.y) - (H2[1]!.y - H2[0]!.y) * (H2[2]!.x - H2[0]!.x)) / 2;
  if (aireDessus < 2) return null;

  const droite = (i: number): [Point2D, Point2D] => [B2[i]!, H2[i]!];
  const disposition: DispositionRealiteIllusion = p !== null ? "aucune" : variante === "tronc" ? "concourantes" : "paralleles";
  const points: { nom: string; p: Point2D; sur: number[] }[] = [];
  if (disposition === "concourantes") points.push({ nom: "S", p: projeterPoint3D(d.sommet!), sur: [0, 1, 2] });
  else if (disposition === "aucune") {
    const [q, r] = [0, 1, 2].filter((i) => i !== p) as [number, number];
    const J = intersectionPixels(...droite(p!), ...droite(q));
    const K = intersectionPixels(...droite(p!), ...droite(r));
    if (!J || !K) return null;
    if (variante === "tronc") {
      const I = intersectionPixels(...droite(q), ...droite(r));
      if (!I) return null;
      points.push({ nom: "I", p: I, sur: [q, r] });
    }
    points.push({ nom: "J", p: J, sur: [p!, q] }, { nom: "K", p: K, sur: [p!, r] });
  }
  // Chaque point de rencontre est sur les PROLONGEMENTS (au-delà du dessus ou de la base), pas trop loin.
  for (const pt of points)
    for (const i of pt.sur) {
      const u = parametre(pt.p, ...droite(i));
      if (sens === "haut" ? u < 1.15 || u > 4 : u > -0.15 || u < -3) return null;
    }

  const longueurs = [0, 1, 2].map((i) => dist2(B2[i]!, H2[i]!));
  const prolongements = [0, 1, 2].map((i) => {
    const [b, h] = droite(i);
    const depart = sens === "haut" ? h : b;
    const dir = sens === "haut" ? { x: h.x - b.x, y: h.y - b.y } : { x: b.x - h.x, y: b.y - h.y };
    const surLaDroite = points.filter((pt) => pt.sur.includes(i)).map((pt) => pt.p);
    const [a, z] = prolongement(depart, dir, surLaDroite, 0.9 * (longueurs.reduce((s, x) => s + x, 0) / 3));
    return [versDessin(a), versDessin(z)] as [Point3D, Point3D];
  });

  // Contrôles en pixels, dans le cadre réel de la figure.
  const cadre = cadreEspace(solide, prolongements.flat());
  const px = (q: Point2D) => cadre.pixel(versDessin(q));
  const sommetsPx = [...B2, ...H2].map(px);
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (dist2(sommetsPx[i]!, sommetsPx[j]!) < 22) return null;
  const xs = sommetsPx.map((q) => q.x);
  const ys = sommetsPx.map((q) => q.y);
  if (Math.max(...xs) - Math.min(...xs) < 120 || Math.max(...ys) - Math.min(...ys) < 110) return null;
  const ptsPx = points.map((pt) => ({ ...pt, px: px(pt.p) }));
  for (const pt of ptsPx) {
    if (sommetsPx.some((s) => dist2(s, pt.px) < 22)) return null;
    for (const i of pt.sur) if (dist2(px(sens === "haut" ? H2[i]! : B2[i]!), pt.px) < 24) return null;
  }
  for (let i = 0; i < ptsPx.length; i++) for (let j = i + 1; j < ptsPx.length; j++) if (dist2(ptsPx[i]!.px, ptsPx[j]!.px) < 24) return null;
  if (p !== null) {
    const Lp = droite(p).map(px) as [Point2D, Point2D];
    if (variante === "tronc") {
      const [I, J, K] = ptsPx.map((x) => x.px) as [Point2D, Point2D, Point2D];
      if (distanceDroite(I, ...Lp) < 20) return null;
      if (distanceDroite(J, I, K) < 16 || distanceDroite(K, I, J) < 16) return null;
    } else {
      const v = { x: Lp[1].x - Lp[0].x, y: Lp[1].y - Lp[0].y };
      const inclinaison = (Math.atan2(Math.abs(v.x), Math.abs(v.y)) * 180) / Math.PI;
      if (inclinaison < 12) return null;
    }
  }

  const pointsDessin: PointDessinRealite[] = points.map((pt) => ({ nom: pt.nom, position: versDessin(pt.p) }));
  return { variante, verdict, disposition, sens, solide, areteDeplacee: p, points: pointsDessin, prolongements, ordre1: melanger([0, 1, 2, 3]), ordre3: melanger([0, 1, 2, 3]) };
}

export function genererRealiteIllusion(variante: VarianteRealiteIllusion): ExerciceRealiteIllusion {
  // Verdict tiré AVANT le dessin, à parts égales.
  const verdict: VerdictRealiteIllusion = Math.random() < 0.5 ? "existe" : "impossible";
  for (;;) {
    const ex = essai(variante, verdict);
    if (ex) return ex;
  }
}

export function construireAvecVariante(id: string): ExerciceRealiteIllusion {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererRealiteIllusion(v.id) : genererExerciceRealiteIllusion();
}

export function genererExerciceRealiteIllusion(): ExerciceRealiteIllusion {
  return genererRealiteIllusion(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
