import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type { ExercicePositionsPlans } from "../core/positionsPlans.types";
import { additionner3D, multiplierScalaire3D, normalePlan, pointAppartientAuPlan, produitScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";
import { calculerAretesAvecVisibilite, pointCacheParSolide } from "./solide3DSketch";

/**
 * Figures SVG de gen101 (« Positions de deux plans et de trois plans ») — UNE source pour l'écran
 * (insérée telle quelle, couleurs du thème par variables CSS) et le papier (couleurs littérales du
 * thème clair : le document d'évaluation autonome n'a pas accès aux variables).
 *
 * Même perspective cavalière et même visibilité des arêtes que `components/Solide3DSketch.tsx`
 * (fonctions pures de `ui/solide3DSketch.ts`, réutilisées) ; ce module ajoute ce que le croquis
 * partagé ne sait pas faire, sans le modifier : plusieurs plans colorés, chacun dessiné par le
 * TRIANGLE de ses trois points (jamais par toute sa section : deux plans confondus montreraient sinon
 * le même polygone, ce qui trahirait la réponse), puis, une fois l'écran clos ou dans le corrigé, la
 * section complète de chaque plan, les droites d'intersection et les points construits. Le cadre
 * s'élargit au besoin pour montrer un point construit hors du croquis de l'énoncé.
 *
 * Identifiants SVG : aucun (pas de `<defs>`) — l'empreinte anti-doublon reste propre.
 */

const LARGEUR = 400;
const HAUTEUR = 320;
const MARGE = 36;

export type ModeFigure = "ecran" | "papier";

/** Couleurs des plans 1, 2, 3 — lisibles en thème clair et sombre. */
export const COULEURS_PLANS = ["#7c3aed", "#15803d", "#ea580c"];
export const NOMS_COULEURS_PLANS = ["violet", "vert", "orange"];
export const COULEUR_DROITE = "#be123c";
export const COULEUR_CONSTRUCTION = "#2563eb";

export interface DroiteFigure {
  a: Point3D;
  b: Point3D;
  couleur: string;
}

export interface SegmentFigure {
  a: Point3D;
  b: Point3D;
  couleur: string;
}

export interface PointFigure {
  position: Point3D;
  label: string;
  couleur: string;
}

export interface OptionsFigure {
  mode: ModeFigure;
  /** Sections complètes des plans (contour pointillé coloré), en plus des triangles. */
  sections?: boolean;
  /** Droites tracées PROLONGÉES (parties cachées par le solide en pointillé). */
  droites?: DroiteFigure[];
  /** Segments de construction (pointillés). */
  segments?: SegmentFigure[];
  points?: PointFigure[];
}

interface Couleurs {
  trait: string;
  cache: string;
  halo: string;
}

function couleurs(mode: ModeFigure): Couleurs {
  return mode === "ecran"
    ? { trait: "var(--solide3d-trait)", cache: "var(--solide3d-trait-cache)", halo: "var(--surface)" }
    : { trait: "#1b1c2b", cache: "#6b6f80", halo: "#ffffff" };
}

export function positionNommee(e: ExercicePositionsPlans, nom: string): Point3D {
  return e.solide.sommets[nom] ?? e.milieux.find((m) => m.nom === nom)!.position;
}

export function pointsPlan(e: ExercicePositionsPlans, i: number): [Point3D, Point3D, Point3D] {
  return e.plans[i]!.map((n) => positionNommee(e, n)) as [Point3D, Point3D, Point3D];
}

// --- Section d'un solide convexe par un plan -----------------------------------------------------

function aretes(solide: Solide3D): [string, string][] {
  return calculerAretesAvecVisibilite(solide).map((a) => a.sommets);
}

/** Polygone (3D, ordre cyclique) de la section du solide par le plan — sommets du solide situés
 * dans le plan et points où le plan traverse une arête. */
export function sectionSolide(solide: Solide3D, plan: [Point3D, Point3D, Point3D]): Point3D[] {
  const n = normalePlan(...plan);
  const signe = (p: Point3D) => produitScalaire3D(n, soustraire3D(p, plan[0]));
  const norme = Math.sqrt(produitScalaire3D(n, n)) || 1;
  const eps = 1e-6 * norme;
  const points: Point3D[] = [];
  const ajouter = (p: Point3D) => {
    if (!points.some((q) => Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) < 1e-6)) points.push(p);
  };
  for (const p of Object.values(solide.sommets)) if (pointAppartientAuPlan(p, plan)) ajouter(p);
  for (const [a, b] of aretes(solide)) {
    const pa = solide.sommets[a]!;
    const pb = solide.sommets[b]!;
    const sa = signe(pa);
    const sb = signe(pb);
    if (Math.abs(sa) < eps || Math.abs(sb) < eps || Math.sign(sa) === Math.sign(sb)) continue;
    ajouter(additionner3D(pa, multiplierScalaire3D(soustraire3D(pb, pa), sa / (sa - sb))));
  }
  if (points.length < 3) return points;
  // Ordre cyclique dans le plan : angle autour du centre, dans une base du plan.
  const centre = multiplierScalaire3D(points.reduce((s, p) => additionner3D(s, p), { x: 0, y: 0, z: 0 }), 1 / points.length);
  const u = soustraire3D(points[0]!, centre);
  const v = { x: n.y * u.z - n.z * u.y, y: n.z * u.x - n.x * u.z, z: n.x * u.y - n.y * u.x };
  return points
    .map((p) => {
      const w = soustraire3D(p, centre);
      return { p, angle: Math.atan2(produitScalaire3D(w, v), produitScalaire3D(w, u)) };
    })
    .sort((a, b) => a.angle - b.angle)
    .map((x) => x.p);
}

// --- Cadre ----------------------------------------------------------------------------------------

interface Cadre {
  pixel: (p: Point3D) => Point2D;
}

function calculerCadre(solide: Solide3D, extra: Point3D[]): Cadre {
  const tous = [...Object.values(solide.sommets), ...extra].map(projeterPoint3D);
  const minX = Math.min(...tous.map((p) => p.x));
  const maxX = Math.max(...tous.map((p) => p.x));
  const minY = Math.min(...tous.map((p) => p.y));
  const maxY = Math.max(...tous.map((p) => p.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const zl = LARGEUR - 2 * MARGE;
  const zh = HAUTEUR - 2 * MARGE;
  const echelle = Math.min(zl / l, zh / h);
  const dx = MARGE + (zl - l * echelle) / 2;
  const dy = MARGE + (zh - h * echelle) / 2;
  return {
    pixel: (p) => {
      const q = projeterPoint3D(p);
      return { x: dx + (q.x - minX) * echelle, y: HAUTEUR - dy - (q.y - minY) * echelle };
    },
  };
}

const f = (x: number) => x.toFixed(1);

function ligne(a: Point2D, b: Point2D, stroke: string, largeur: number, pointille: string | null): string {
  const dash = pointille ? ` stroke-dasharray="${pointille}"` : "";
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${largeur}" stroke-linecap="round"${dash}/>`;
}

function polygone(points: Point2D[], fill: string, opacite: number, stroke: string, largeur: number, pointille: string | null): string {
  const dash = pointille ? ` stroke-dasharray="${pointille}"` : "";
  return `<polygon points="${points.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")}" fill="${fill}" fill-opacity="${opacite}" stroke="${stroke}" stroke-width="${largeur}" stroke-linejoin="round"${dash}/>`;
}

function texte(p: Point2D, contenu: string, couleur: string, halo: string, taille = 15): string {
  return `<text x="${f(p.x)}" y="${f(p.y)}" fill="${couleur}" font-family="system-ui, sans-serif" font-size="${taille}" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="${halo}" stroke-width="3" stroke-linejoin="round">${contenu}</text>`;
}

/** Droite (a, b) prolongée, découpée en morceaux visibles / cachés par le solide. */
function morceauxDroite(solide: Solide3D, cadre: Cadre, a: Point3D, b: Point3D): { p1: Point2D; p2: Point2D; cache: boolean }[] {
  const dir = soustraire3D(b, a);
  const pa = cadre.pixel(a);
  const pb = cadre.pixel(b);
  let tMin = -0.6;
  let tMax = 1.6;
  for (const [o, d, taille] of [
    [pa.x, pb.x - pa.x, LARGEUR],
    [pa.y, pb.y - pa.y, HAUTEUR],
  ] as const) {
    if (Math.abs(d) < 1e-9) continue;
    const t1 = (8 - o) / d;
    const t2 = (taille - 8 - o) / d;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  tMin = Math.min(tMin, 0);
  tMax = Math.max(tMax, 1);
  const en = (t: number) => additionner3D(a, multiplierScalaire3D(dir, t));
  const PAS = 160;
  const morceaux: { p1: Point2D; p2: Point2D; cache: boolean }[] = [];
  let debut = tMin;
  let etat = pointCacheParSolide(solide, en(tMin));
  for (let i = 1; i <= PAS; i++) {
    const t = tMin + ((tMax - tMin) * i) / PAS;
    const e = pointCacheParSolide(solide, en(t));
    if (e !== etat || i === PAS) {
      morceaux.push({ p1: cadre.pixel(en(debut)), p2: cadre.pixel(en(t)), cache: etat });
      debut = t;
      etat = e;
    }
  }
  return morceaux;
}

/** Position d'étiquette décalée vers l'extérieur depuis le centre du croquis. */
function decaler(p: Point2D, centre: Point2D, distance = 14): Point2D {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const l = Math.hypot(dx, dy);
  if (l < 1e-6) return { x: p.x, y: p.y - distance };
  return { x: p.x + (dx / l) * distance, y: p.y + (dy / l) * distance };
}

/**
 * Figure complète, en SVG autonome. Calques : arêtes cachées, intérieurs des triangles (et des
 * sections), arêtes visibles, contours des triangles, droites, segments de construction, points,
 * étiquettes.
 */
export function figurePositionsPlansSvg(e: ExercicePositionsPlans, options: OptionsFigure): string {
  const c = couleurs(options.mode);
  const solide = e.solide;
  const extra = [...(options.points ?? []).map((p) => p.position)];
  const cadre = calculerCadre(solide, extra);
  const pix = (p: Point3D) => cadre.pixel(p);
  const sommetsPx = Object.fromEntries(Object.entries(solide.sommets).map(([n, p]) => [n, pix(p)]));
  const valeurs = Object.values(sommetsPx);
  const centre = { x: valeurs.reduce((s, p) => s + p.x, 0) / valeurs.length, y: valeurs.reduce((s, p) => s + p.y, 0) / valeurs.length };
  const aretesVis = calculerAretesAvecVisibilite(solide);
  const morceaux: string[] = [];

  for (const a of aretesVis.filter((x) => !x.visible)) morceaux.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.cache, 1.4, "5 4"));

  const triangles = e.plans.map((_, i) => pointsPlan(e, i).map(pix));
  if (options.sections) {
    e.plans.forEach((_, i) => {
      const sec = sectionSolide(solide, pointsPlan(e, i)).map(pix);
      if (sec.length >= 3) morceaux.push(polygone(sec, COULEURS_PLANS[i]!, 0.1, COULEURS_PLANS[i]!, 1.6, "7 4"));
    });
  }
  triangles.forEach((t, i) => morceaux.push(polygone(t, COULEURS_PLANS[i]!, 0.2, "none", 0, null)));

  for (const a of aretesVis.filter((x) => x.visible)) morceaux.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.trait, 1.75, null));

  triangles.forEach((t, i) => morceaux.push(polygone(t, "none", 0, COULEURS_PLANS[i]!, 2.4, null)));

  for (const d of options.droites ?? []) {
    for (const m of morceauxDroite(solide, cadre, d.a, d.b)) morceaux.push(ligne(m.p1, m.p2, d.couleur, m.cache ? 2.2 : 3, m.cache ? "6 5" : null));
  }
  for (const s of options.segments ?? []) morceaux.push(ligne(pix(s.a), pix(s.b), s.couleur, 1.8, "4 4"));

  // Points nommés (milieux), puis sommets et étiquettes.
  for (const p of Object.values(sommetsPx)) morceaux.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="2.5" fill="${c.trait}"/>`);
  for (const m of e.milieux) {
    const p = pix(m.position);
    morceaux.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="3.6" fill="${c.trait}" stroke="${c.halo}" stroke-width="1.2"/>`);
  }
  for (const p of options.points ?? []) {
    const q = pix(p.position);
    morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5" fill="${p.couleur}" stroke="${c.halo}" stroke-width="1.5"/>`);
  }
  for (const [nom, p] of Object.entries(sommetsPx)) morceaux.push(texte(decaler(p, centre), nom, c.trait, c.halo));
  for (const m of e.milieux) morceaux.push(texte(decaler(pix(m.position), centre), m.nom, c.trait, c.halo));
  for (const p of options.points ?? []) morceaux.push(texte(decaler(pix(p.position), centre, 15), p.label, p.couleur, c.halo));

  const style = options.mode === "ecran" ? ' style="display:block;width:100%;height:auto"' : ' style="display:block;width:100%;max-width:380px;height:auto;margin:6px auto"';
  return `<svg viewBox="0 0 ${LARGEUR} ${HAUTEUR}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solide en perspective cavalière et plans étudiés"${style}>${morceaux.join("")}</svg>`;
}
