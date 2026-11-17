import type { CadreDessin, ExercicePerspectiveCavaliere, PointDessin } from "../core/perspectiveCavaliere.types";

/**
 * Figure SVG de gen104 (« Dessiner en perspective cavalière ») — UNE source pour l'écran (insérée
 * telle quelle, couleurs du thème par variables CSS) et le papier (couleurs littérales du thème
 * clair). Quadrillage de 1 cm : la face avant tombe sur ses nœuds, les sommets arrière jamais (voir
 * le générateur).
 *
 * Repère : coordonnées du DESSIN en cm (`y` vers le haut) → unités SVG (`y` vers le bas), 400 unités
 * de large quel que soit le cadre (textes lisibles à 390 px). Sur papier, la figure s'imprime à
 * l'ÉCHELLE RÉELLE (`width` en cm : un carreau = 1 cm), pour que l'élève y mesure à la règle.
 *
 * Identifiants SVG : aucun (pas de `<defs>`) — l'empreinte anti-doublon reste propre.
 */

export const LARGEUR_VUE = 400;

export type ModeFigure = "ecran" | "papier";

export interface VueFigure {
  cadre: CadreDessin;
  largeur: number;
  hauteur: number;
  /** Unités SVG par cm. */
  echelle: number;
}

export function vueFigure(cadre: CadreDessin): VueFigure {
  const echelle = LARGEUR_VUE / (cadre.xMax - cadre.xMin);
  return { cadre, largeur: LARGEUR_VUE, hauteur: (cadre.yMax - cadre.yMin) * echelle, echelle };
}

export function versVue(v: VueFigure, p: PointDessin): PointDessin {
  return { x: (p.x - v.cadre.xMin) * v.echelle, y: (v.cadre.yMax - p.y) * v.echelle };
}

export function depuisVue(v: VueFigure, q: PointDessin): PointDessin {
  return { x: v.cadre.xMin + q.x / v.echelle, y: v.cadre.yMax - q.y / v.echelle };
}

export const COULEURS_CAVALIERE = {
  eleve: "#ea580c",
  juste: "#15803d",
  faux: "#dc2626",
  construction: "#2563eb",
  annotation: "#7c3aed",
};

export interface SegmentFigure {
  a: PointDessin;
  b: PointDessin;
  /** Absent : couleur du trait du solide. */
  couleur?: string;
  pointille?: boolean;
  /** Trait fin (construction, aperçu). */
  fin?: boolean;
}

export interface PointFigure {
  p: PointDessin;
  label?: string;
  /** Position de l'étiquette (cm) ; absente : au-dessus à droite du point. */
  positionLabel?: PointDessin;
  couleur?: string;
  /** Disque plein plus gros (point de l'élève). */
  gros?: boolean;
}

export interface TexteFigure {
  p: PointDessin;
  texte: string;
  couleur: string;
  taille?: number;
}

export interface ArcFigure {
  centre: PointDessin;
  rayon: number;
  /** Angles en degrés (sens trigonométrique), de `debut` à `fin`. */
  debut: number;
  fin: number;
  couleur: string;
}

export interface OptionsFigure {
  mode: ModeFigure;
  cadre: CadreDessin;
  segments: SegmentFigure[];
  points: PointFigure[];
  textes?: TexteFigure[];
  arcs?: ArcFigure[];
  /** Halo du point actif (zone de la poignée). */
  halo?: PointDessin | null;
  /** Centre du solide : les étiquettes s'en écartent de préférence. */
  centre?: PointDessin;
  libelle: string;
}

interface Couleurs {
  trait: string;
  grille: string;
  halo: string;
}

function couleurs(mode: ModeFigure): Couleurs {
  return mode === "ecran"
    ? { trait: "var(--solide3d-trait, #1b1c2b)", grille: "var(--ink-faint, #8a97a1)", halo: "var(--surface, #ffffff)" }
    : { trait: "#1b1c2b", grille: "#9aa3b2", halo: "#ffffff" };
}

function distanceSegment(p: PointDessin, a: PointDessin, b: PointDessin): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

const f = (x: number) => (Math.abs(x) < 0.05 ? "0" : x.toFixed(1));

function texteSvg(q: PointDessin, contenu: string, couleur: string, halo: string, taille: number): string {
  return `<text x="${f(q.x)}" y="${f(q.y)}" fill="${couleur}" font-family="system-ui, sans-serif" font-size="${taille}" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="${halo}" stroke-width="3.5" stroke-linejoin="round">${contenu}</text>`;
}

/** Centre du solide sur le dessin : sert à écarter les étiquettes des arêtes. */
export function centreDessin(e: ExercicePerspectiveCavaliere): PointDessin {
  const n = e.sommets.length;
  return { x: e.sommets.reduce((s, x) => s + x.dessin.x, 0) / n, y: e.sommets.reduce((s, x) => s + x.dessin.y, 0) / n };
}

/**
 * Figure complète en SVG autonome. Calques : quadrillage, segments pointillés, segments pleins,
 * arcs, halo, points, étiquettes.
 */
export function figureCavaliereSvg(options: OptionsFigure): string {
  const c = couleurs(options.mode);
  const v = vueFigure(options.cadre);
  const px = (p: PointDessin) => versVue(v, p);
  const m: string[] = [];
  const { xMin, xMax, yMin, yMax } = options.cadre;

  // Quadrillage : lignes de 1 cm (et de 5 mm, plus pâles, sur papier).
  const papier = options.mode === "papier";
  if (papier) {
    for (let x = xMin + 0.5; x < xMax; x += 1) m.push(`<line x1="${f(px({ x, y: 0 }).x)}" y1="0" x2="${f(px({ x, y: 0 }).x)}" y2="${f(v.hauteur)}" stroke="${c.grille}" stroke-width="0.5" stroke-opacity="0.45"/>`);
    for (let y = yMin + 0.5; y < yMax; y += 1) m.push(`<line x1="0" y1="${f(px({ x: 0, y }).y)}" x2="${f(v.largeur)}" y2="${f(px({ x: 0, y }).y)}" stroke="${c.grille}" stroke-width="0.5" stroke-opacity="0.45"/>`);
  }
  for (let x = xMin; x <= xMax + 1e-9; x += 1) m.push(`<line x1="${f(px({ x, y: 0 }).x)}" y1="0" x2="${f(px({ x, y: 0 }).x)}" y2="${f(v.hauteur)}" stroke="${c.grille}" stroke-width="${papier ? 0.9 : 0.8}" stroke-opacity="${papier ? 0.8 : 0.45}"/>`);
  for (let y = yMin; y <= yMax + 1e-9; y += 1) m.push(`<line x1="0" y1="${f(px({ x: 0, y }).y)}" x2="${f(v.largeur)}" y2="${f(px({ x: 0, y }).y)}" stroke="${c.grille}" stroke-width="${papier ? 0.9 : 0.8}" stroke-opacity="${papier ? 0.8 : 0.45}"/>`);

  const ligne = (s: SegmentFigure) => {
    const a = px(s.a);
    const b = px(s.b);
    const largeur = s.fin ? 1.4 : s.pointille ? 1.8 : 2.4;
    const dash = s.pointille ? ` stroke-dasharray="${s.fin ? "4 4" : "7 5"}"` : "";
    return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${s.couleur ?? c.trait}" stroke-width="${largeur}" stroke-linecap="round"${dash}/>`;
  };
  for (const s of options.segments.filter((x) => x.pointille)) m.push(ligne(s));
  for (const s of options.segments.filter((x) => !x.pointille)) m.push(ligne(s));

  for (const a of options.arcs ?? []) {
    const r = a.rayon * v.echelle;
    const o = px(a.centre);
    const point = (deg: number) => ({ x: o.x + r * Math.cos((deg * Math.PI) / 180), y: o.y - r * Math.sin((deg * Math.PI) / 180) });
    const p1 = point(a.debut);
    const p2 = point(a.fin);
    const grand = Math.abs(a.fin - a.debut) > 180 ? 1 : 0;
    m.push(`<path d="M ${f(p1.x)} ${f(p1.y)} A ${f(r)} ${f(r)} 0 ${grand} 0 ${f(p2.x)} ${f(p2.y)}" fill="none" stroke="${a.couleur}" stroke-width="1.6"/>`);
  }

  if (options.halo) {
    const h = px(options.halo);
    m.push(`<circle cx="${f(h.x)}" cy="${f(h.y)}" r="20" fill="${COULEURS_CAVALIERE.eleve}" fill-opacity="0.13" stroke="${COULEURS_CAVALIERE.eleve}" stroke-opacity="0.45" stroke-width="1"/>`);
  }

  for (const p of options.points) {
    const q = px(p.p);
    const couleur = p.couleur ?? c.trait;
    m.push(p.gros ? `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5.5" fill="${couleur}" stroke="${c.halo}" stroke-width="1.5"/>` : `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3" fill="${couleur}"/>`);
  }
  // Étiquettes : parmi 16 directions autour du point, celle qui s'écarte le plus des traits, des
  // autres points et des étiquettes déjà posées (préférence pour l'extérieur du solide).
  const segmentsVue = options.segments.map((s) => [px(s.a), px(s.b)] as const);
  const pointsVue = options.points.map((p) => px(p.p));
  // Textes déjà posés : échantillonnés sur leur largeur (environ 0,55 × taille par caractère).
  const occupes: PointDessin[] = (options.textes ?? []).flatMap((t) => {
    const q = px(t.p);
    const demi = (0.55 * (t.taille ?? 14) * t.texte.length) / 2;
    const n = Math.max(1, Math.round(demi / 8));
    return Array.from({ length: 2 * n + 1 }, (_, i) => ({ x: q.x - demi + (i * demi) / n, y: q.y }));
  });
  const centre = options.centre ? px(options.centre) : null;
  for (const p of options.points) {
    if (!p.label) continue;
    const q = px(p.p);
    let pos: PointDessin;
    if (p.positionLabel) pos = px(p.positionLabel);
    else {
      let meilleur = -Infinity;
      pos = { x: q.x + 12, y: q.y - 12 };
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8;
        const c = { x: q.x + 15 * Math.cos(a), y: q.y - 15 * Math.sin(a) };
        if (c.x < 8 || c.x > v.largeur - 8 || c.y < 8 || c.y > v.hauteur - 8) continue;
        let d = Infinity;
        for (const [s1, s2] of segmentsVue) d = Math.min(d, distanceSegment(c, s1, s2));
        for (const r of pointsVue) d = Math.min(d, Math.hypot(c.x - r.x, c.y - r.y) - 2);
        for (const r of occupes) d = Math.min(d, Math.hypot(c.x - r.x, c.y - r.y) - 12);
        const dehors = centre ? ((c.x - q.x) * (q.x - centre.x) + (c.y - q.y) * (q.y - centre.y)) / (15 * (Math.hypot(q.x - centre.x, q.y - centre.y) || 1)) : 0;
        const score = Math.min(d, 14) + 2 * dehors;
        if (score > meilleur) {
          meilleur = score;
          pos = c;
        }
      }
    }
    occupes.push(pos);
    m.push(texteSvg(pos, p.label, p.couleur ?? c.trait, c.halo, 16));
  }
  for (const t of options.textes ?? []) m.push(texteSvg(px(t.p), t.texte, t.couleur, c.halo, t.taille ?? 14));

  const largeurCm = xMax - xMin;
  const style = papier ? ` style="display:block;width:${largeurCm}cm;max-width:100%;height:auto;margin:6px auto"` : ' style="display:block;width:100%;height:auto"';
  return `<svg viewBox="0 0 ${f(v.largeur)} ${f(v.hauteur)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${options.libelle}"${style}>${m.join("")}</svg>`;
}
