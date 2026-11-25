/**
 * Nuage de points des générateurs du lot H2 du 5e ch. 6 (5gen78–5gen81) : repère « bien choisi » du
 * cours (§ 1) — fenêtre ajustée aux données, graduations régulières (pas 1, 2, 2,5 ou 5 × 10ᵏ), axes
 * qui ne commencent pas forcément à 0 (brisure d'axe dessinée au coin), titre de chaque axe ; points,
 * droites d'ajustement rognées au cadre (`<svg>` imbriqué, AUCUN identifiant ni `clipPath`), points
 * étiquetés (G, prévision), verticales en pointillés, bande « interpolation ». Chaîne SVG autonome, la
 * même à l'écran (`FigureSvg`), sur papier (`enteteHtml`) et dans le corrigé (`figureHtml`).
 */

import type { Point2 } from "../core5e/statistiqueLotH2";

export const COULEUR_POINTS = "#1971c2";
export const COULEUR_DROITE = "#c2410c";
export const COULEUR_DROITE2 = "#2f9e44";
export const COULEUR_ABERRANT = "#c92a2a";
const GRILLE = "#dde3ea";
const AXE = "#495057";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);

export interface DroiteNuage {
  a: number;
  b: number;
  couleur?: string;
  pointilles?: boolean;
  /** Étiquette écrite près du bord droit (« d₁ », « Mayer »). */
  label?: string;
}

export interface PointNuage {
  x: number;
  y: number;
  label?: string;
  couleur?: string;
  /** Croix (point moyen) plutôt qu'un disque. */
  croix?: boolean;
  /** Cercle autour du point (point aberrant). */
  entoure?: boolean;
  position?: "ne" | "no" | "se" | "so";
}

export interface SpecNuage {
  points: Point2[];
  titreX: string;
  titreY: string;
  /** Fenêtre imposée (sinon : ajustée aux points, aux points étiquetés et aux verticales). */
  fenetre?: { xmin: number; xmax: number; ymin: number; ymax: number };
  droites?: DroiteNuage[];
  marques?: PointNuage[];
  verticales?: { x: number; couleur?: string }[];
  /** Bande ombrée [de ; a] (intervalle des données : zone d'interpolation). */
  bande?: { de: number; a: number; texte?: string };
  /** Points à entourer (indices dans `points`). */
  entoures?: number[];
  largeur?: number;
  hauteur?: number;
}

/** Nombre écrit sur la figure : virgule décimale, « − » typographique, espace des milliers. */
export function nombreNuage(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  const [ent, dec] = String(Math.abs(r)).split(".");
  const entier = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ent!;
  const s = dec ? `${entier},${dec}` : entier;
  return r < 0 ? `−${s}` : s;
}

/** Pas « rond » pour environ `cible` intervalles. */
export function pasRond(etendue: number, cible: number): number {
  const brut = etendue / cible;
  const p = 10 ** Math.floor(Math.log10(brut));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= brut) return m * p;
  return 10 * p;
}

function fenetreAuto(s: SpecNuage): { xmin: number; xmax: number; ymin: number; ymax: number; px: number; py: number } {
  const xs = [...s.points.map((p) => p.x), ...(s.marques ?? []).map((m) => m.x), ...(s.verticales ?? []).map((v) => v.x)];
  const ys = [...s.points.map((p) => p.y), ...(s.marques ?? []).map((m) => m.y)];
  if (s.bande) xs.push(s.bande.de, s.bande.a);
  const f = s.fenetre;
  const x0 = f ? f.xmin : Math.min(...xs);
  const x1 = f ? f.xmax : Math.max(...xs);
  const y0 = f ? f.ymin : Math.min(...ys);
  const y1 = f ? f.ymax : Math.max(...ys);
  const px = pasRond(Math.max(x1 - x0, 1e-6), 6);
  const py = pasRond(Math.max(y1 - y0, 1e-6), 5);
  if (f) return { xmin: Math.floor(x0 / px) * px, xmax: Math.ceil(x1 / px) * px, ymin: Math.floor(y0 / py) * py, ymax: Math.ceil(y1 / py) * py, px, py };
  // Une demi-graduation de marge autour des données (aucun point collé au cadre).
  let xmin = Math.floor((x0 - px * 0.4) / px) * px;
  let ymin = Math.floor((y0 - py * 0.4) / py) * py;
  // Zéro gardé quand il est proche (axe qui commence à 0, sans brisure).
  if (xmin > 0 && x0 <= 1.6 * px) xmin = 0;
  if (ymin > 0 && y0 <= 1.6 * py) ymin = 0;
  const xmax = Math.ceil((x1 + px * 0.4) / px) * px;
  const ymax = Math.ceil((y1 + py * 0.4) / py) * py;
  return { xmin, xmax, ymin, ymax, px, py };
}

export function nuageSvg(s: SpecNuage): string {
  const L = s.largeur ?? 380;
  const H = s.hauteur ?? 270;
  const police = 11;
  const g = 44; // marge gauche (graduations y)
  const d = 14;
  const h = 26; // marge haute (titre de l'axe y)
  const bas = 34; // graduations x + titre de l'axe x
  const W = L - g - d;
  const Hh = H - h - bas;
  const fen = fenetreAuto(s);
  const X = (x: number) => g + ((x - fen.xmin) / (fen.xmax - fen.xmin)) * W;
  const Y = (y: number) => h + ((fen.ymax - y) / (fen.ymax - fen.ymin)) * Hh;
  const o: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  if (s.bande) {
    const a = Math.max(fen.xmin, s.bande.de);
    const b = Math.min(fen.xmax, s.bande.a);
    if (b > a) {
      o.push(`<rect x="${f1(X(a))}" y="${h}" width="${f1(X(b) - X(a))}" height="${Hh}" fill="#e7f5ff"/>`);
      if (s.bande.texte) o.push(`<text x="${f1((X(a) + X(b)) / 2)}" y="${h + police + 2}" font-size="${police - 1}" text-anchor="middle" fill="#1864ab" ${POLICE} ${HALO}>${s.bande.texte}</text>`);
    }
  }
  const nx = Math.round((fen.xmax - fen.xmin) / fen.px);
  const ny = Math.round((fen.ymax - fen.ymin) / fen.py);
  for (let k = 0; k <= nx; k++) {
    const x = fen.xmin + k * fen.px;
    o.push(`<line x1="${f1(X(x))}" y1="${h}" x2="${f1(X(x))}" y2="${h + Hh}" stroke="${GRILLE}" stroke-width="1"/>`);
    o.push(`<text x="${f1(X(x))}" y="${h + Hh + police + 4}" font-size="${police}" text-anchor="middle" fill="${AXE}" ${POLICE}>${nombreNuage(x)}</text>`);
  }
  for (let k = 0; k <= ny; k++) {
    const y = fen.ymin + k * fen.py;
    o.push(`<line x1="${g}" y1="${f1(Y(y))}" x2="${g + W}" y2="${f1(Y(y))}" stroke="${GRILLE}" stroke-width="1"/>`);
    o.push(`<text x="${g - 5}" y="${f1(Y(y) + police / 2.8)}" font-size="${police}" text-anchor="end" fill="${AXE}" ${POLICE}>${nombreNuage(y)}</text>`);
  }
  // Axes sur les bords bas et gauche du cadre, fléchés.
  o.push(`<line x1="${g}" y1="${h + Hh}" x2="${g + W + 8}" y2="${h + Hh}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<path d="M ${g + W + 12},${h + Hh} l -7,-4 l 0,8 z" fill="${AXE}"/>`);
  o.push(`<line x1="${g}" y1="${h + Hh}" x2="${g}" y2="${h - 8}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<path d="M ${g},${h - 12} l -4,7 l 8,0 z" fill="${AXE}"/>`);
  // Brisure d'axe quand l'axe ne commence pas à 0.
  const zig = (x: number, y: number, horizontal: boolean) =>
    horizontal
      ? `<path d="M ${f1(x - 6)},${f1(y)} l 3,-4 l 4,8 l 3,-4" fill="none" stroke="${AXE}" stroke-width="1.3" ${'stroke-linejoin="round"'}/>`
      : `<path d="M ${f1(x)},${f1(y + 6)} l -4,-3 l 8,-4 l -4,-3" fill="none" stroke="${AXE}" stroke-width="1.3"/>`;
  if (fen.xmin !== 0) o.push(`<rect x="${g + 4}" y="${h + Hh - 3}" width="12" height="6" fill="#ffffff"/>`, zig(g + 12, h + Hh, true));
  if (fen.ymin !== 0) o.push(`<rect x="${g - 3}" y="${h + Hh - 18}" width="6" height="12" fill="#ffffff"/>`, zig(g, h + Hh - 18, false));
  o.push(`<text x="${g + W}" y="${H - 4}" font-size="${police}" text-anchor="end" fill="#212529" font-weight="600" ${POLICE} ${HALO}>${s.titreX}</text>`);
  o.push(`<text x="${g - 4}" y="${h - 14}" font-size="${police}" text-anchor="start" fill="#212529" font-weight="600" ${POLICE} ${HALO}>${s.titreY}</text>`);
  // Zone de tracé rognée : verticales et droites.
  const tx = (x: number) => ((x - fen.xmin) / (fen.xmax - fen.xmin)) * W;
  const ty = (y: number) => ((fen.ymax - y) / (fen.ymax - fen.ymin)) * Hh;
  const z: string[] = [];
  for (const v of s.verticales ?? []) z.push(`<line x1="${f1(tx(v.x))}" y1="0" x2="${f1(tx(v.x))}" y2="${Hh}" stroke="${v.couleur ?? COULEUR_DROITE2}" stroke-width="1.6" stroke-dasharray="5 4"/>`);
  for (const dr of s.droites ?? []) {
    const ya = dr.a * fen.xmin + dr.b;
    const yb = dr.a * fen.xmax + dr.b;
    const tiret = dr.pointilles ? ' stroke-dasharray="7 5"' : "";
    z.push(`<line x1="0" y1="${f1(ty(ya))}" x2="${W}" y2="${f1(ty(yb))}" stroke="${dr.couleur ?? COULEUR_DROITE}" stroke-width="2.2" stroke-linecap="round"${tiret}/>`);
  }
  o.push(`<svg x="${g}" y="${h}" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" overflow="hidden">${z.join("")}</svg>`);
  // Étiquettes des droites : au bord droit, à la hauteur de la droite (dans le cadre).
  for (const dr of s.droites ?? []) {
    if (!dr.label) continue;
    let xe = fen.xmax - (fen.xmax - fen.xmin) * 0.04;
    let ye = dr.a * xe + dr.b;
    if (ye > fen.ymax || ye < fen.ymin) {
      ye = ye > fen.ymax ? fen.ymax - (fen.ymax - fen.ymin) * 0.06 : fen.ymin + (fen.ymax - fen.ymin) * 0.06;
      xe = (ye - dr.b) / dr.a;
    }
    o.push(`<text x="${f1(X(xe))}" y="${f1(Y(ye) - 6)}" font-size="${police + 1}" font-weight="bold" font-style="italic" text-anchor="end" fill="${dr.couleur ?? COULEUR_DROITE}" ${POLICE} ${HALO}>${dr.label}</text>`);
  }
  const entoures = new Set(s.entoures ?? []);
  s.points.forEach((p, i) => {
    o.push(`<circle cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="3.6" fill="${COULEUR_POINTS}" stroke="#ffffff" stroke-width="0.8"/>`);
    if (entoures.has(i)) o.push(`<circle cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="8" fill="none" stroke="${COULEUR_ABERRANT}" stroke-width="2"/>`);
  });
  for (const m of s.marques ?? []) {
    const cx = X(m.x);
    const cy = Y(m.y);
    const coul = m.couleur ?? COULEUR_DROITE2;
    if (m.croix) o.push(`<path d="M ${f1(cx - 5)},${f1(cy - 5)} L ${f1(cx + 5)},${f1(cy + 5)} M ${f1(cx - 5)},${f1(cy + 5)} L ${f1(cx + 5)},${f1(cy - 5)}" stroke="${coul}" stroke-width="2.4" stroke-linecap="round"/>`);
    else o.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="4.2" fill="#ffffff" stroke="${coul}" stroke-width="2.2"/>`);
    if (m.entoure) o.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="8" fill="none" stroke="${COULEUR_ABERRANT}" stroke-width="2"/>`);
    if (m.label) {
      const pos = m.position ?? "no";
      const dx = pos === "ne" || pos === "se" ? 7 : -7;
      const dy = pos === "ne" || pos === "no" ? -7 : police + 5;
      o.push(`<text x="${f1(cx + dx)}" y="${f1(cy + dy)}" font-size="${police + 1}" font-weight="bold" text-anchor="${dx > 0 ? "start" : "end"}" fill="${coul}" ${POLICE} ${HALO}>${m.label}</text>`);
    }
  }
  o.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="nuage-stat" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg">${o.join("")}</svg>`;
}
