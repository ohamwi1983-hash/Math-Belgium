import type { Point3D } from "../core/geometrieEspace.types";
import type { CandidatPercee, ExercicePercee } from "../core/perceePlanAuxiliaire.types";
import { additionner3D, multiplierScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";
import { calculerAretesAvecVisibilite, pointCacheParSolide } from "./solide3DSketch";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, COULEURS_PLANS, sectionSolide } from "./figurePositionsPlans";

/**
 * Figures SVG de gen102 (« Point de percée par plan auxiliaire ») — UNE source pour l'écran (insérée
 * telle quelle, couleurs du thème par variables CSS pour le trait du solide) et le papier (couleurs
 * littérales du thème clair).
 *
 * Même perspective cavalière et même visibilité des arêtes que `components/Solide3DSketch.tsx`
 * (fonctions pures de `ui/solide3DSketch.ts`) et mêmes couleurs que gen101
 * (`ui/figurePositionsPlans.ts`, réutilisées sans modification) : plan α en violet (triangle de ses
 * trois points), plan auxiliaire π en vert, droite d en orange (prolongée, parties cachées en
 * pointillé), droite b et point de percée en rouge, constructions en bleu.
 *
 * Le cadre est FIXE pour tout l'exercice et sur papier (`ExercicePercee.pointsCadre` : point de
 * percée et points construits de toutes les suites, justes ou leurres) — la figure ne saute pas d'un
 * écran à l'autre, et l'élève a la place de prolonger les droites. Même formule que
 * `generateurs/perceePlanAuxiliaire/geometriePercee.ts::cadrePercee`.
 *
 * Identifiants SVG : aucun (pas de `<defs>`) — l'empreinte anti-doublon reste propre.
 */

export const LARGEUR_FIGURE = 400;
export const HAUTEUR_FIGURE = 320;
const MARGE = 36;

export const COULEUR_D = COULEURS_PLANS[2]!;
export const COULEUR_ALPHA = COULEURS_PLANS[0]!;
export const COULEUR_PI = COULEURS_PLANS[1]!;
export { COULEUR_CONSTRUCTION, COULEUR_DROITE };

export type ModeFigure = "ecran" | "papier";

export interface PointFigurePercee {
  position: Point3D;
  label: string;
  couleur: string;
  /** Anneau autour du point (sélection) au lieu d'un disque plein. */
  anneau?: boolean;
}

export interface SegmentFigurePercee {
  a: Point3D;
  b: Point3D;
  couleur: string;
  pointille?: boolean;
}

export interface AnneauFigure {
  numero: number;
  pixel: Point2D;
  selectionne: boolean;
  /** Après validation : juste (vert), faux choisi (rouge), sinon neutre. */
  etat?: "juste" | "faux" | null;
}

export interface OptionsFigurePercee {
  mode: ModeFigure;
  /** Plan auxiliaire montré (triangle vert). */
  planAux?: [string, string, string] | null;
  /** Sections complètes de α et de π (contours pointillés), figure finale. */
  sections?: boolean;
  /** Droites PROLONGÉES (parties cachées en pointillé). */
  droites?: SegmentFigurePercee[];
  segments?: SegmentFigurePercee[];
  points?: PointFigurePercee[];
  anneaux?: AnneauFigure[];
  /** Étiquette « d » au bout de la droite (énoncé). */
  etiquetteD?: boolean;
}

export function positionNommee(e: ExercicePercee, nom: string): Point3D {
  return e.solide.sommets[nom] ?? e.points.find((p) => p.nom === nom)!.position;
}

export function pointsDuPlan(e: ExercicePercee, noms: readonly string[]): [Point3D, Point3D, Point3D] {
  return noms.map((n) => positionNommee(e, n)) as [Point3D, Point3D, Point3D];
}

// --- Cadre ----------------------------------------------------------------------------------------

export interface CadreFigure {
  pixel: (p: Point3D) => Point2D;
}

export function cadreFigure(e: ExercicePercee): CadreFigure {
  const tous = [...Object.values(e.solide.sommets), ...e.pointsCadre].map(projeterPoint3D);
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

export function intersectionPixels(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): Point2D | null {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const det = d1x * d2y - d1y * d2x;
  if (Math.abs(det) < 1e-9) return null;
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / det;
  return { x: a1.x + d1x * t, y: a1.y + d1y * t };
}

/** Position, sur le dessin, d'un point numéroté de l'écran 3 : là où d croise sa droite d'appui. */
export function pixelAnneau(e: ExercicePercee, cadre: CadreFigure, c: CandidatPercee): Point2D {
  if (c.position) return cadre.pixel(c.position);
  const [x, y] = e.droite.map((n) => cadre.pixel(positionNommee(e, n))) as [Point2D, Point2D];
  return intersectionPixels(x, y, cadre.pixel(c.appui[0]), cadre.pixel(c.appui[1]))!;
}

/** Point de rencontre, sur le dessin, de deux droites nommées (leurre « gauche » compris). */
export function pixelRencontre(e: ExercicePercee, cadre: CadreFigure, d1: [string, string], d2: [string, string]): Point2D | null {
  const p = (n: string) => cadre.pixel(positionNommee(e, n));
  return intersectionPixels(p(d1[0]), p(d1[1]), p(d2[0]), p(d2[1]));
}

// --- Dessin ---------------------------------------------------------------------------------------

interface Couleurs {
  trait: string;
  cache: string;
  halo: string;
  fondAnneau: string;
}

function couleurs(mode: ModeFigure): Couleurs {
  return mode === "ecran"
    ? { trait: "var(--solide3d-trait)", cache: "var(--solide3d-trait-cache)", halo: "var(--surface)", fondAnneau: "var(--surface)" }
    : { trait: "#1b1c2b", cache: "#6b6f80", halo: "#ffffff", fondAnneau: "#ffffff" };
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

/** Droite (a, b) prolongée jusqu'au bord du cadre, découpée en morceaux visibles / cachés. */
function morceauxDroite(e: ExercicePercee, cadre: CadreFigure, a: Point3D, b: Point3D): { p1: Point2D; p2: Point2D; cache: boolean }[] {
  const dir = soustraire3D(b, a);
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
  const en = (t: number) => additionner3D(a, multiplierScalaire3D(dir, t));
  const PAS = 180;
  const morceaux: { p1: Point2D; p2: Point2D; cache: boolean }[] = [];
  let debut = tMin;
  let etat = pointCacheParSolide(e.solide, en(tMin));
  for (let i = 1; i <= PAS; i++) {
    const t = tMin + ((tMax - tMin) * i) / PAS;
    const s = pointCacheParSolide(e.solide, en(t));
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

/** Position de l'étiquette « d » : près du bord du cadre, sur la droite, du côté du point le plus haut. */
function positionEtiquetteD(e: ExercicePercee, cadre: CadreFigure): Point2D {
  const [x, y] = e.droite.map((n) => cadre.pixel(positionNommee(e, n))) as [Point2D, Point2D];
  const [haut, bas] = x.y <= y.y ? [x, y] : [y, x];
  const dx = haut.x - bas.x;
  const dy = haut.y - bas.y;
  const l = Math.hypot(dx, dy) || 1;
  // Avancer depuis le point le plus haut jusqu'à 22 px du bord.
  let t = 0;
  while (t < 400) {
    const q = { x: haut.x + (dx / l) * (t + 4), y: haut.y + (dy / l) * (t + 4) };
    if (q.x < 22 || q.x > LARGEUR_FIGURE - 22 || q.y < 22 || q.y > HAUTEUR_FIGURE - 22) break;
    t += 4;
  }
  const q = { x: haut.x + (dx / l) * t, y: haut.y + (dy / l) * t };
  return { x: q.x + (-dy / l) * 12, y: q.y + (dx / l) * 12 };
}

/**
 * Figure complète, en SVG autonome. Calques : arêtes cachées, intérieurs des triangles (et des
 * sections), arêtes visibles, contours des triangles, droites prolongées, segments, points nommés,
 * points ajoutés, anneaux numérotés, étiquettes.
 */
export function figurePerceeSvg(e: ExercicePercee, options: OptionsFigurePercee): string {
  const c = couleurs(options.mode);
  const solide = e.solide;
  const cadre = cadreFigure(e);
  const pix = cadre.pixel;
  const sommetsPx = Object.fromEntries(Object.entries(solide.sommets).map(([n, p]) => [n, pix(p)]));
  const valeurs = Object.values(sommetsPx);
  const centre = { x: valeurs.reduce((s, p) => s + p.x, 0) / valeurs.length, y: valeurs.reduce((s, p) => s + p.y, 0) / valeurs.length };
  const aretes = calculerAretesAvecVisibilite(solide);
  const m: string[] = [];

  for (const a of aretes.filter((x) => !x.visible)) m.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.cache, 1.4, "5 4"));

  const plans: { noms: readonly string[]; couleur: string }[] = [{ noms: e.plan, couleur: COULEUR_ALPHA }];
  if (options.planAux) plans.push({ noms: options.planAux, couleur: COULEUR_PI });
  if (options.sections) {
    for (const p of plans) {
      const sec = sectionSolide(solide, pointsDuPlan(e, p.noms)).map(pix);
      if (sec.length >= 3) m.push(polygone(sec, p.couleur, 0.08, p.couleur, 1.6, "7 4"));
    }
  }
  const triangles = plans.map((p) => ({ pts: pointsDuPlan(e, p.noms).map(pix), couleur: p.couleur }));
  for (const t of triangles) m.push(polygone(t.pts, t.couleur, 0.18, "none", 0, null));

  for (const a of aretes.filter((x) => x.visible)) m.push(ligne(sommetsPx[a.sommets[0]]!, sommetsPx[a.sommets[1]]!, c.trait, 1.75, null));

  for (const t of triangles) m.push(polygone(t.pts, "none", 0, t.couleur, 2.3, null));

  // Droite d, prolongée.
  const [dx, dy] = e.droite.map((n) => positionNommee(e, n)) as [Point3D, Point3D];
  for (const mo of morceauxDroite(e, cadre, dx, dy)) m.push(ligne(mo.p1, mo.p2, COULEUR_D, mo.cache ? 2 : 2.8, mo.cache ? "6 5" : null));
  for (const d of options.droites ?? []) {
    for (const mo of morceauxDroite(e, cadre, d.a, d.b)) m.push(ligne(mo.p1, mo.p2, d.couleur, mo.cache ? 2 : 2.8, mo.cache ? "6 5" : null));
  }
  for (const s of options.segments ?? []) m.push(ligne(pix(s.a), pix(s.b), s.couleur, s.pointille ? 1.8 : 3, s.pointille ? "4 4" : null));

  for (const p of valeurs) m.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="2.5" fill="${c.trait}"/>`);
  for (const p of e.points) {
    const q = pix(p.position);
    m.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.6" fill="${c.trait}" stroke="${c.halo}" stroke-width="1.2"/>`);
  }
  for (const p of options.points ?? []) {
    const q = pix(p.position);
    m.push(
      p.anneau
        ? `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="10" fill="none" stroke="${p.couleur}" stroke-width="3"/>`
        : `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5" fill="${p.couleur}" stroke="${c.halo}" stroke-width="1.5"/>`,
    );
  }
  // Anneaux numérotés (écran 3) : numéro décalé perpendiculairement à d.
  const pdx = pix(dx);
  const pdy = pix(dy);
  const ld = Math.hypot(pdy.x - pdx.x, pdy.y - pdx.y) || 1;
  const normale = { x: -(pdy.y - pdx.y) / ld, y: (pdy.x - pdx.x) / ld };
  for (const a of options.anneaux ?? []) {
    const trait = a.etat === "juste" ? "#15803d" : a.etat === "faux" ? "#dc2626" : COULEUR_CONSTRUCTION;
    const plein = a.selectionne || a.etat === "juste";
    m.push(`<circle cx="${f(a.pixel.x)}" cy="${f(a.pixel.y)}" r="7.5" fill="${plein ? trait : c.fondAnneau}" fill-opacity="${plein ? 0.9 : 0.85}" stroke="${trait}" stroke-width="2.4"/>`);
    const sens = normale.y > 0 ? -1 : 1; // numéro au-dessus de d
    m.push(texte({ x: a.pixel.x + normale.x * 17 * sens, y: a.pixel.y + normale.y * 17 * sens }, String(a.numero), trait, c.halo, 15));
  }

  for (const [nom, p] of Object.entries(sommetsPx)) m.push(texte(decaler(p, centre), nom, c.trait, c.halo));
  for (const p of e.points) m.push(texte(decaler(pix(p.position), centre), p.nom, c.trait, c.halo));
  for (const p of options.points ?? []) if (p.label) m.push(texte(decaler(pix(p.position), centre, 16), p.label, p.couleur, c.halo));
  if (options.etiquetteD) m.push(texte(positionEtiquetteD(e, cadre), "d", COULEUR_D, c.halo, 16));

  const style = options.mode === "ecran" ? ' style="display:block;width:100%;height:auto"' : ' style="display:block;width:100%;max-width:380px;height:auto;margin:6px auto"';
  return `<svg viewBox="0 0 ${LARGEUR_FIGURE} ${HAUTEUR_FIGURE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solide en perspective cavalière, droite d et plan étudié"${style}>${m.join("")}</svg>`;
}
