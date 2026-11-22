import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import { additionner3D, multiplierScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";
import { calculerAretesAvecVisibilite, pointCacheParSolide } from "./solide3DSketch";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, COULEURS_PLANS } from "./figurePositionsPlans";
import { HAUTEUR_FIGURE, LARGEUR_FIGURE, intersectionPixels } from "./figurePercee";

/**
 * Figures SVG du lot H du 4e ch. 8 — gen133 (« Lire un solide en perspective ») et gen134
 * (« Intersection de deux plans par parallélisme »). UNE source pour l'écran (couleurs du thème par
 * variables CSS pour le trait du solide) et le papier (couleurs littérales du thème clair), comme
 * `figurePercee.ts` (gen102), dont elle reprend le cadre 400 × 320 (même `FigureCliquable`), les
 * couleurs (`figurePositionsPlans.ts`) et la visibilité des arêtes (`solide3DSketch.ts`).
 *
 * Calques : arêtes cachées (pointillés, sauf `toutesAretesPleines` — gen133, écran « arêtes
 * cachées » : l'énoncé ne doit pas les montrer), intérieurs des polygones (plans), arêtes visibles,
 * arêtes surlignées, contours des polygones, droites prolongées (parties cachées en pointillé),
 * segments, points nommés, marques, anneaux numérotés, étiquettes.
 *
 * Identifiants SVG : aucun (pas de `<defs>`) — l'empreinte anti-doublon reste propre.
 */

export { LARGEUR_FIGURE, HAUTEUR_FIGURE, COULEUR_CONSTRUCTION, COULEUR_DROITE };
export const COULEUR_PLAN_1 = COULEURS_PLANS[0]!;
export const COULEUR_PLAN_2 = COULEURS_PLANS[1]!;
export const COULEUR_ACCENT = COULEURS_PLANS[2]!;
const MARGE = 34;

export type ModeFigureEspace = "ecran" | "papier";

export interface PointNommeEspace {
  nom: string;
  position: Point3D;
}

export interface CadreEspace {
  pixel: (p: Point3D) => Point2D;
}

/** Cadre FIXE d'une instance : sommets du solide et points supplémentaires (`extra`) — la figure ne
 * saute pas d'un écran à l'autre. */
export function cadreEspace(solide: Solide3D, extra: Point3D[] = []): CadreEspace {
  const tous = [...Object.values(solide.sommets), ...extra].map(projeterPoint3D);
  const minX = Math.min(...tous.map((p) => p.x));
  const maxX = Math.max(...tous.map((p) => p.x));
  const minY = Math.min(...tous.map((p) => p.y));
  const maxY = Math.max(...tous.map((p) => p.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const zl = LARGEUR_FIGURE - 2 * MARGE;
  const zh = HAUTEUR_FIGURE - 2 * MARGE;
  const echelle = Math.min(zl / l, zh / h);
  const dx = MARGE + (zl - l * echelle) / 2;
  const dy = MARGE + (zh - h * echelle) / 2;
  return {
    pixel: (p) => {
      const q = projeterPoint3D(p);
      return { x: dx + (q.x - minX) * echelle, y: HAUTEUR_FIGURE - dy - (q.y - minY) * echelle };
    },
  };
}

export interface PolygoneEspace {
  sommets: Point3D[];
  couleur: string;
  opacite?: number;
  /** Contour plein (défaut : oui). */
  contour?: boolean;
}

export interface SegmentEspace {
  a: Point3D;
  b: Point3D;
  couleur: string;
  pointille?: boolean;
  epaisseur?: number;
}

export interface MarqueEspace {
  position: Point3D;
  couleur: string;
  label?: string;
  /** Anneau autour du point au lieu d'un disque plein. */
  anneau?: boolean;
}

export interface AnneauEspace {
  numero: number;
  pixel: Point2D;
  selectionne: boolean;
  /** Juste (vert), faux déjà essayé (rouge), sinon neutre. */
  etat?: "juste" | "faux" | null;
}

export interface AreteSurlignee {
  a: string;
  b: string;
  couleur: string;
  /** Texte posé à côté du milieu de l'arête (longueur dessinée…). */
  texte?: string;
}

export interface OptionsFigureEspace {
  mode: ModeFigureEspace;
  solide: Solide3D;
  /** Points nommés supplémentaires (milieux, points sur les arêtes), toujours dessinés. */
  points?: PointNommeEspace[];
  /** Points supplémentaires qui entrent dans le cadre. */
  cadre?: Point3D[];
  toutesAretesPleines?: boolean;
  polygones?: PolygoneEspace[];
  aretes?: AreteSurlignee[];
  /** Droites prolongées jusqu'au bord, parties cachées par le solide en pointillé. */
  droites?: SegmentEspace[];
  segments?: SegmentEspace[];
  marques?: MarqueEspace[];
  anneaux?: AnneauEspace[];
  ariaLabel: string;
}

interface Couleurs {
  trait: string;
  cache: string;
  halo: string;
  fond: string;
}

function couleurs(mode: ModeFigureEspace): Couleurs {
  return mode === "ecran"
    ? { trait: "var(--solide3d-trait)", cache: "var(--solide3d-trait-cache)", halo: "var(--surface)", fond: "var(--surface)" }
    : { trait: "#1b1c2b", cache: "#6b6f80", halo: "#ffffff", fond: "#ffffff" };
}

const f = (x: number) => x.toFixed(1);

function ligne(a: Point2D, b: Point2D, stroke: string, largeur: number, pointille: string | null): string {
  const dash = pointille ? ` stroke-dasharray="${pointille}"` : "";
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${largeur}" stroke-linecap="round"${dash}/>`;
}

function polygone(points: Point2D[], fill: string, opacite: number, stroke: string, largeur: number): string {
  return `<polygon points="${points.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")}" fill="${fill}" fill-opacity="${opacite}" stroke="${stroke}" stroke-width="${largeur}" stroke-linejoin="round"/>`;
}

function texte(p: Point2D, contenu: string, couleur: string, halo: string, taille = 15): string {
  return `<text x="${f(p.x)}" y="${f(p.y)}" fill="${couleur}" font-family="system-ui, sans-serif" font-size="${taille}" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="${halo}" stroke-width="3" stroke-linejoin="round">${contenu}</text>`;
}

/** Bornes du paramètre t de (a + t·(b − a)) qui restent dans le cadre (marge 8 px). */
export function bornesDansCadre(cadre: CadreEspace, a: Point3D, b: Point3D): [number, number] {
  const pa = cadre.pixel(a);
  const pb = cadre.pixel(b);
  let tMin = -50;
  let tMax = 50;
  for (const [o, dd, taille] of [
    [pa.x, pb.x - pa.x, LARGEUR_FIGURE],
    [pa.y, pb.y - pa.y, HAUTEUR_FIGURE],
  ] as const) {
    if (Math.abs(dd) < 1e-9) continue;
    const t1 = (8 - o) / dd;
    const t2 = (taille - 8 - o) / dd;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  return [tMin, tMax];
}

/** Droite (a, b) prolongée jusqu'au bord du cadre, découpée en morceaux visibles / cachés. */
function morceauxDroite(solide: Solide3D, cadre: CadreEspace, a: Point3D, b: Point3D): { p1: Point2D; p2: Point2D; cache: boolean }[] {
  const dir = soustraire3D(b, a);
  const [tMin, tMax] = bornesDansCadre(cadre, a, b);
  const en = (t: number) => additionner3D(a, multiplierScalaire3D(dir, t));
  const PAS = 180;
  const morceaux: { p1: Point2D; p2: Point2D; cache: boolean }[] = [];
  let debut = tMin;
  let etat = pointCacheParSolide(solide, en(tMin));
  for (let i = 1; i <= PAS; i++) {
    const t = tMin + ((tMax - tMin) * i) / PAS;
    const s = pointCacheParSolide(solide, en(t));
    if (s !== etat || i === PAS) {
      morceaux.push({ p1: cadre.pixel(en(debut)), p2: cadre.pixel(en(t)), cache: etat });
      debut = t;
      etat = s;
    }
  }
  return morceaux;
}

function decaler(p: Point2D, centre: Point2D, distance = 14): Point2D {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const l = Math.hypot(dx, dy);
  if (l < 1e-6) return { x: p.x, y: p.y - distance };
  return { x: p.x + (dx / l) * distance, y: p.y + (dy / l) * distance };
}

/** Centre 2D des sommets du solide (étiquettes décalées vers l'extérieur). */
function centreSommets(solide: Solide3D, cadre: CadreEspace): Point2D {
  const v = Object.values(solide.sommets).map(cadre.pixel);
  return { x: v.reduce((s, p) => s + p.x, 0) / v.length, y: v.reduce((s, p) => s + p.y, 0) / v.length };
}

/** Points de croisement, SUR LE DESSIN, d'une droite 2D (p1, p2) avec des segments 2D. */
export function croisementsDessin(p1: Point2D, p2: Point2D, segments: { a: Point2D; b: Point2D; nom: string }[]): { pixel: Point2D; nom: string }[] {
  const res: { pixel: Point2D; nom: string }[] = [];
  for (const s of segments) {
    const i = intersectionPixels(p1, p2, s.a, s.b);
    if (!i) continue;
    const lx = s.b.x - s.a.x;
    const ly = s.b.y - s.a.y;
    const l2 = lx * lx + ly * ly || 1;
    const u = ((i.x - s.a.x) * lx + (i.y - s.a.y) * ly) / l2;
    if (u < 0.02 || u > 0.98) continue;
    res.push({ pixel: i, nom: s.nom });
  }
  return res;
}

export function figureEspaceSvg(o: OptionsFigureEspace): string {
  const c = couleurs(o.mode);
  const solide = o.solide;
  const points = o.points ?? [];
  const cadre = cadreEspace(solide, [...points.map((p) => p.position), ...(o.cadre ?? [])]);
  const pix = cadre.pixel;
  const sommetsPx = Object.fromEntries(Object.entries(solide.sommets).map(([n, p]) => [n, pix(p)])) as Record<string, Point2D>;
  const centre = centreSommets(solide, cadre);
  const aretes = calculerAretesAvecVisibilite(solide);
  const m: string[] = [];

  const cachee = (a: { visible: boolean }) => !a.visible && !o.toutesAretesPleines;
  for (const a of aretes.filter(cachee)) m.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.cache, 1.4, "5 4"));
  for (const p of o.polygones ?? []) m.push(polygone(p.sommets.map(pix), p.couleur, p.opacite ?? 0.16, "none", 0));
  for (const a of aretes.filter((x) => !cachee(x))) m.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.trait, 1.75, null));
  for (const a of o.aretes ?? []) {
    const visible = aretes.find((x) => (x.sommets[0] === a.a && x.sommets[1] === a.b) || (x.sommets[0] === a.b && x.sommets[1] === a.a));
    const pointille = visible && cachee(visible) ? "6 4" : null;
    m.push(ligne(sommetsPx[a.a]!, sommetsPx[a.b]!, a.couleur, 3.4, pointille));
  }
  for (const p of o.polygones ?? []) if (p.contour !== false) m.push(polygone(p.sommets.map(pix), "none", 0, p.couleur, 2.2));

  for (const d of o.droites ?? []) {
    for (const mo of morceauxDroite(solide, cadre, d.a, d.b)) m.push(ligne(mo.p1, mo.p2, d.couleur, mo.cache ? 2 : (d.epaisseur ?? 2.6), mo.cache ? "6 5" : null));
  }
  for (const s of o.segments ?? []) m.push(ligne(pix(s.a), pix(s.b), s.couleur, s.epaisseur ?? (s.pointille ? 1.8 : 3.2), s.pointille ? "5 4" : null));

  for (const p of Object.values(sommetsPx)) m.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="2.5" fill="${c.trait}"/>`);
  for (const p of points) {
    const q = pix(p.position);
    m.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.8" fill="${c.trait}" stroke="${c.halo}" stroke-width="1.2"/>`);
  }
  for (const p of o.marques ?? []) {
    const q = pix(p.position);
    m.push(
      p.anneau
        ? `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="10" fill="none" stroke="${p.couleur}" stroke-width="3"/>`
        : `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5" fill="${p.couleur}" stroke="${c.halo}" stroke-width="1.5"/>`,
    );
  }
  for (const a of o.anneaux ?? []) {
    const trait = a.etat === "juste" ? "#15803d" : a.etat === "faux" ? "#dc2626" : COULEUR_CONSTRUCTION;
    const plein = a.selectionne || a.etat === "juste" || a.etat === "faux";
    m.push(`<circle cx="${f(a.pixel.x)}" cy="${f(a.pixel.y)}" r="7.5" fill="${plein ? trait : c.fond}" fill-opacity="0.9" stroke="${trait}" stroke-width="2.4"/>`);
    m.push(texte({ x: a.pixel.x, y: a.pixel.y - 17 }, String(a.numero), trait, c.halo, 15));
  }

  for (const [nom, p] of Object.entries(sommetsPx)) m.push(texte(decaler(p, centre), nom, c.trait, c.halo));
  for (const p of points) m.push(texte(decaler(pix(p.position), centre), p.nom, c.trait, c.halo));
  for (const p of o.marques ?? []) if (p.label) m.push(texte(decaler(pix(p.position), centre, 17), p.label, p.couleur, c.halo));
  for (const a of o.aretes ?? []) {
    if (!a.texte) continue;
    const pa = sommetsPx[a.a]!;
    const pb = sommetsPx[a.b]!;
    const milieu = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
    // Perpendiculaire à l'arête, du côté opposé au centre du solide.
    const l = Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1;
    let n = { x: -(pb.y - pa.y) / l, y: (pb.x - pa.x) / l };
    if ((milieu.x - centre.x) * n.x + (milieu.y - centre.y) * n.y < 0) n = { x: -n.x, y: -n.y };
    m.push(texte({ x: milieu.x + n.x * 20, y: milieu.y + n.y * 20 }, a.texte, a.couleur, c.halo, 14));
  }

  const style = o.mode === "ecran" ? ' style="display:block;width:100%;height:auto"' : ' style="display:block;width:100%;max-width:380px;height:auto;margin:6px auto"';
  return `<svg viewBox="0 0 ${LARGEUR_FIGURE} ${HAUTEUR_FIGURE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.ariaLabel}"${style}>${m.join("")}</svg>`;
}

/** Figure de corrigé papier, réduite (colonne du corrigé ≈ 6,5 cm). */
export function figureCorrige(svg: string): string {
  return `<div style="max-width:6.5cm;margin:6px auto">${svg}</div>`;
}
