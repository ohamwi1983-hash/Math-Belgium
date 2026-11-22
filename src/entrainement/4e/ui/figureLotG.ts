import type { Droite, Pt } from "./geometrieLotG";
import { boiteDisque, boiteTexte, graduationsSansChevauchement, type Boite, type Graduation } from "./graduationsSvg";

/**
 * Figure SVG autonome (écran APRÈS la réponse, corrigé papier) du lot G du chapitre 7 de 4e
 * (gen92–gen95) : repère orthonormé à quadrillage d'une unité, droites tracées d'un bord à l'autre,
 * cercles, segments (pointillés possibles), points nommés, angle droit. Même échelle en x et en y,
 * fenêtre calculée sur les objets ; aucun identifiant SVG (ni `id`, ni `url(#…)`). Jamais montrée
 * avant la réponse qu'elle trahirait.
 */

export const COULEURS = { encre: "#1f2937", accent: "#c2410c", bleu: "#1971c2", vert: "#2f9e44", gris: "#868e96" } as const;
type Couleur = keyof typeof COULEURS;

export interface ObjetsFigure {
  points?: { p: Pt; nom: string; couleur?: Couleur; position?: "ne" | "no" | "se" | "so" }[];
  droites?: { d: Droite; couleur?: Couleur; nom?: string; pointilles?: boolean }[];
  cercles?: { c: Pt; r: number; couleur?: Couleur }[];
  segments?: { a: Pt; b: Pt; couleur?: Couleur; pointilles?: boolean }[];
  anglesDroits?: { sommet: Pt; vers1: Pt; vers2: Pt }[];
  /** Points à garder dans la fenêtre sans les dessiner. */
  inclure?: Pt[];
  /** Opt-in (audit 4e ch. 7, lot C — corrigé de gen47) : un nombre d'axe qui toucherait un point,
   * son nom ou le nom d'une droite passe de l'autre côté de l'axe, sinon n'est pas écrit
   * (`graduationsSvg.ts`). Absent : figure identique à avant (gen45, gen48, lot G gen92–95). */
  graduationsLisibles?: boolean;
}

const TAILLE = 300;

function fmt(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

function nomSvg(nom: string): string {
  return nom.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Segment visible d'une droite dans le rectangle [x0;x1]×[y0;y1]. */
function clipDroite(d: Droite, x0: number, x1: number, y0: number, y1: number): [Pt, Pt] | null {
  const pts: Pt[] = [];
  const ajouter = (p: Pt) => {
    if (p.x >= x0 - 1e-9 && p.x <= x1 + 1e-9 && p.y >= y0 - 1e-9 && p.y <= y1 + 1e-9 && !pts.some((q) => Math.abs(q.x - p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9)) pts.push(p);
  };
  if (d.b !== 0) {
    ajouter({ x: x0, y: -(d.a * x0 + d.c) / d.b });
    ajouter({ x: x1, y: -(d.a * x1 + d.c) / d.b });
  }
  if (d.a !== 0) {
    ajouter({ x: -(d.b * y0 + d.c) / d.a, y: y0 });
    ajouter({ x: -(d.b * y1 + d.c) / d.a, y: y1 });
  }
  return pts.length >= 2 ? [pts[0]!, pts[1]!] : null;
}

export function figureLotG(o: ObjetsFigure): string {
  const xs: number[] = [0];
  const ys: number[] = [0];
  for (const p of o.points ?? []) (xs.push(p.p.x), ys.push(p.p.y));
  for (const p of o.inclure ?? []) (xs.push(p.x), ys.push(p.y));
  for (const s of o.segments ?? []) (xs.push(s.a.x, s.b.x), ys.push(s.a.y, s.b.y));
  for (const c of o.cercles ?? []) (xs.push(c.c.x - c.r, c.c.x + c.r), ys.push(c.c.y - c.r, c.c.y + c.r));
  let x0 = Math.floor(Math.min(...xs)) - 1;
  let x1 = Math.ceil(Math.max(...xs)) + 1;
  let y0 = Math.floor(Math.min(...ys)) - 1;
  let y1 = Math.ceil(Math.max(...ys)) + 1;
  // Fenêtre carrée (même échelle en x et en y), au moins 8 unités.
  const cote = Math.max(8, x1 - x0, y1 - y0);
  x0 -= Math.floor((cote - (x1 - x0)) / 2);
  x1 = x0 + cote;
  y0 -= Math.floor((cote - (y1 - y0)) / 2);
  y1 = y0 + cote;
  const marge = 14;
  const u = (TAILLE - 2 * marge) / cote;
  const X = (x: number) => marge + (x - x0) * u;
  const Y = (y: number) => marge + (y1 - y) * u;
  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${TAILLE}" height="${TAILLE}" fill="#ffffff"/>`);
  // Quadrillage d'une unité (graduations tous les 1, 2 ou 5 selon la taille).
  const pasEtiquette = cote <= 12 ? 2 : cote <= 24 ? 5 : 10;
  for (let x = x0; x <= x1; x++) parts.push(`<line x1="${fmt(X(x))}" y1="${fmt(Y(y0))}" x2="${fmt(X(x))}" y2="${fmt(Y(y1))}" stroke="${x === 0 ? "#495057" : "#dee2e6"}" stroke-width="${x === 0 ? 1.2 : 0.6}"/>`);
  for (let y = y0; y <= y1; y++) parts.push(`<line x1="${fmt(X(x0))}" y1="${fmt(Y(y))}" x2="${fmt(X(x1))}" y2="${fmt(Y(y))}" stroke="${y === 0 ? "#495057" : "#dee2e6"}" stroke-width="${y === 0 ? 1.2 : 0.6}"/>`);
  const moins = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
  if (o.graduationsLisibles) {
    parts.push(graduationsLisiblesLotG(o, { x0, x1, y0, y1, X, Y, marge, pasEtiquette }));
  } else {
  for (let x = Math.ceil(x0 / pasEtiquette) * pasEtiquette; x < x1; x += pasEtiquette) {
    if (x === 0 || x === x0) continue;
    const yt = Math.min(Math.max(Y(0) + 11, marge + 9), TAILLE - 3);
    parts.push(`<text x="${fmt(X(x))}" y="${fmt(yt)}" font-size="9" text-anchor="middle" fill="#495057" font-family="sans-serif">${moins(x)}</text>`);
  }
  for (let y = Math.ceil(y0 / pasEtiquette) * pasEtiquette; y < y1; y += pasEtiquette) {
    if (y === 0 || y === y0) continue;
    const xt = Math.min(Math.max(X(0) - 3, marge + 12), TAILLE - 3);
    parts.push(`<text x="${fmt(xt)}" y="${fmt(Y(y) + 3)}" font-size="9" text-anchor="end" fill="#495057" font-family="sans-serif">${moins(y)}</text>`);
  }
  if (x0 < 0 && x1 > 0 && y0 < 0 && y1 > 0) parts.push(`<text x="${fmt(X(0) - 3)}" y="${fmt(Y(0) + 11)}" font-size="9" text-anchor="end" fill="#495057" font-family="sans-serif">0</text>`);
  }
  for (const c of o.cercles ?? []) {
    parts.push(`<circle cx="${fmt(X(c.c.x))}" cy="${fmt(Y(c.c.y))}" r="${fmt(c.r * u)}" fill="none" stroke="${COULEURS[c.couleur ?? "bleu"]}" stroke-width="2"/>`);
  }
  for (const dr of o.droites ?? []) {
    const seg = clipDroite(dr.d, x0, x1, y0, y1);
    if (!seg) continue;
    parts.push(`<line x1="${fmt(X(seg[0].x))}" y1="${fmt(Y(seg[0].y))}" x2="${fmt(X(seg[1].x))}" y2="${fmt(Y(seg[1].y))}" stroke="${COULEURS[dr.couleur ?? "accent"]}" stroke-width="2"${dr.pointilles ? ' stroke-dasharray="6 4"' : ""}/>`);
    if (dr.nom) {
      // Nom près de l'extrémité la plus haute à droite, rentré dans le cadre.
      const e = seg[0].x + seg[0].y > seg[1].x + seg[1].y ? seg[0] : seg[1];
      const tx = Math.min(Math.max(X(e.x), marge + 8), TAILLE - marge - 8);
      const ty = Math.min(Math.max(Y(e.y) + 12, marge + 10), TAILLE - marge - 2);
      parts.push(`<text x="${fmt(tx)}" y="${fmt(ty)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS[dr.couleur ?? "accent"]}" font-family="serif">${nomSvg(dr.nom)}</text>`);
    }
  }
  for (const s of o.segments ?? []) {
    parts.push(`<line x1="${fmt(X(s.a.x))}" y1="${fmt(Y(s.a.y))}" x2="${fmt(X(s.b.x))}" y2="${fmt(Y(s.b.y))}" stroke="${COULEURS[s.couleur ?? "vert"]}" stroke-width="2"${s.pointilles ? ' stroke-dasharray="5 4"' : ""}/>`);
  }
  for (const a of o.anglesDroits ?? []) {
    const unit = (p: Pt) => {
      const dx = p.x - a.sommet.x;
      const dy = p.y - a.sommet.y;
      const n = Math.hypot(dx, dy) || 1;
      return { x: dx / n, y: dy / n };
    };
    const t = 9 / u;
    const v1 = unit(a.vers1);
    const v2 = unit(a.vers2);
    const p1 = { x: a.sommet.x + v1.x * t, y: a.sommet.y + v1.y * t };
    const p2 = { x: a.sommet.x + (v1.x + v2.x) * t, y: a.sommet.y + (v1.y + v2.y) * t };
    const p3 = { x: a.sommet.x + v2.x * t, y: a.sommet.y + v2.y * t };
    parts.push(`<polyline points="${fmt(X(p1.x))},${fmt(Y(p1.y))} ${fmt(X(p2.x))},${fmt(Y(p2.y))} ${fmt(X(p3.x))},${fmt(Y(p3.y))}" fill="none" stroke="${COULEURS.encre}" stroke-width="1"/>`);
  }
  for (const p of o.points ?? []) {
    const couleur = COULEURS[p.couleur ?? "encre"];
    const px = X(p.p.x);
    const py = Y(p.p.y);
    parts.push(`<circle cx="${fmt(px)}" cy="${fmt(py)}" r="3.2" fill="${couleur}"/>`);
    const pos = p.position ?? "ne";
    const dx = pos.endsWith("e") ? 5 : -5;
    const dy = pos.startsWith("n") ? -5 : 13;
    let tx = px + dx;
    const ty = Math.min(Math.max(py + dy, 11), TAILLE - 3);
    const anchor = pos.endsWith("e") ? "start" : "end";
    if (anchor === "start" && tx > TAILLE - 16) tx = TAILLE - 16;
    if (anchor === "end" && tx < 16) tx = 16;
    parts.push(`<text x="${fmt(tx)}" y="${fmt(ty)}" font-size="13" font-weight="600" text-anchor="${anchor}" fill="${couleur}" font-family="serif">${nomSvg(p.nom)}</text>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE}" height="${TAILLE}" viewBox="0 0 ${TAILLE} ${TAILLE}" role="img">${parts.join("")}</svg>`;
}

/** Position d'un nom de droite (même règle que `figureLotG`). */
function positionNomDroite(seg: [Pt, Pt], X: (x: number) => number, Y: (y: number) => number, marge: number): { tx: number; ty: number } {
  const e = seg[0].x + seg[0].y > seg[1].x + seg[1].y ? seg[0] : seg[1];
  return { tx: Math.min(Math.max(X(e.x), marge + 8), TAILLE - marge - 8), ty: Math.min(Math.max(Y(e.y) + 12, marge + 10), TAILLE - marge - 2) };
}

/** Nombres des axes de `figureLotG` qui ne touchent ni un point, ni son nom, ni le nom d'une droite. */
function graduationsLisiblesLotG(
  o: ObjetsFigure,
  f: { x0: number; x1: number; y0: number; y1: number; X: (x: number) => number; Y: (y: number) => number; marge: number; pasEtiquette: number },
): string {
  const { x0, x1, y0, y1, X, Y, marge, pasEtiquette } = f;
  const obstacles: Boite[] = [];
  for (const p of o.points ?? []) {
    const px = X(p.p.x);
    const py = Y(p.p.y);
    obstacles.push(boiteDisque(px, py, 3.2));
    const pos = p.position ?? "ne";
    let tx = px + (pos.endsWith("e") ? 5 : -5);
    const ty = Math.min(Math.max(py + (pos.startsWith("n") ? -5 : 13), 11), TAILLE - 3);
    const ancre = pos.endsWith("e") ? "start" : "end";
    if (ancre === "start" && tx > TAILLE - 16) tx = TAILLE - 16;
    if (ancre === "end" && tx < 16) tx = 16;
    obstacles.push(boiteTexte(tx, ty, p.nom, 13, ancre));
  }
  for (const dr of o.droites ?? []) {
    if (!dr.nom) continue;
    const seg = clipDroite(dr.d, x0, x1, y0, y1);
    if (!seg) continue;
    const { tx, ty } = positionNomDroite(seg, X, Y, marge);
    obstacles.push(boiteTexte(tx, ty, dr.nom, 12, "middle"));
  }
  const graduations: Graduation[] = [];
  for (let x = Math.ceil(x0 / pasEtiquette) * pasEtiquette; x < x1; x += pasEtiquette) {
    if (x === 0 || x === x0) continue;
    const yt = Math.min(Math.max(Y(0) + 11, marge + 9), TAILLE - 3);
    const yr = Math.min(Math.max(Y(0) - 4, marge + 9), TAILLE - 3);
    graduations.push({ valeur: x, x: X(x), y: yt, xRepli: X(x), yRepli: yr === yt ? yt - 15 : yr, ancre: "middle", ancreRepli: "middle" });
  }
  for (let y = Math.ceil(y0 / pasEtiquette) * pasEtiquette; y < y1; y += pasEtiquette) {
    if (y === 0 || y === y0) continue;
    const xt = Math.min(Math.max(X(0) - 3, marge + 12), TAILLE - 3);
    const xr = Math.min(Math.max(X(0) + 3, marge + 2), TAILLE - 16);
    graduations.push({ valeur: y, x: xt, y: Y(y) + 3, xRepli: xr, yRepli: Y(y) + 3, ancre: "end", ancreRepli: "start" });
  }
  if (x0 < 0 && x1 > 0 && y0 < 0 && y1 > 0) graduations.push({ valeur: 0, x: X(0) - 3, y: Y(0) + 11, xRepli: X(0) + 3, yRepli: Y(0) - 4, ancre: "end", ancreRepli: "start" });
  return `<g font-family="sans-serif">${graduationsSansChevauchement(graduations, obstacles, { taille: 9, couleur: "#495057" })}</g>`;
}
