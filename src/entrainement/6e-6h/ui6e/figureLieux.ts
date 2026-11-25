import { boiteDisque, boiteTexte, chevauche, graduationsSansChevauchement, largeurTexte } from "../../4e/ui/graduationsSvg";
import type { Boite, Graduation } from "../../4e/ui/graduationsSvg";

/**
 * Figure SVG COMMUNE aux quatre générateurs du 6e ch. 9 « Lieux géométriques » (6gen54–6gen57, audit,
 * lot B, décision 4 de l'utilisateur) : configuration de l'énoncé avec « ? » pour l'inconnue, puis
 * lieu (ou point, cercle, droite cherchés) révélé APRÈS la réponse. Une seule source pour l'écran et
 * pour le corrigé papier (chaîne SVG autonome : aucun `id`, aucun `url(#…)`).
 * - Repère ORTHONORMÉ (même échelle en x et en y : un cercle est rond, un angle droit est droit).
 * - Quadrillage d'une unité (ou de 2, 5 si la fenêtre est grande), nombres des axes en « − » et
 *   virgule, jamais sous un point ni sous une étiquette (`graduationsSansChevauchement`).
 * - Étiquettes rentrées dans le cadre (jamais rognées), point « creux » pour un point exclu.
 */

export const COULEURS_LIEUX = { encre: "#1f2937", accent: "#c2410c", bleu: "#1971c2", vert: "#2f9e44", gris: "#868e96", violet: "#7048e8" } as const;
export type CouleurLieux = keyof typeof COULEURS_LIEUX;

export interface P2 {
  x: number;
  y: number;
}

export interface ObjetsLieux {
  points?: { p: P2; nom?: string; couleur?: CouleurLieux; creux?: boolean; position?: "ne" | "no" | "se" | "so" }[];
  droites?: { a: number; b: number; c: number; couleur?: CouleurLieux; pointilles?: boolean; epais?: boolean; nom?: string }[];
  segments?: { a: P2; b: P2; couleur?: CouleurLieux; pointilles?: boolean; epais?: boolean }[];
  /** Demi-droite d'origine `o`, de direction `u`. */
  demiDroites?: { o: P2; u: P2; couleur?: CouleurLieux; epais?: boolean }[];
  cercles?: { c: P2; r: number; couleur?: CouleurLieux; pointilles?: boolean; epais?: boolean }[];
  courbes?: { pts: P2[]; couleur?: CouleurLieux; epais?: boolean; pointilles?: boolean }[];
  polygones?: { pts: P2[]; couleur?: CouleurLieux; rempli?: boolean; trait?: boolean }[];
  /** Bande verticale x₁ ≤ x ≤ x₂ (ou horizontale) remplie. */
  bandes?: { sens: "verticale" | "horizontale"; min: number; max: number; couleur?: CouleurLieux }[];
  anglesDroits?: { sommet: P2; vers1: P2; vers2: P2 }[];
  /** Points gardés dans la fenêtre sans être dessinés. */
  inclure?: P2[];
  /** Fenêtre imposée (sinon calculée sur les objets). */
  fenetre?: { xmin: number; xmax: number; ymin: number; ymax: number };
  /** Côté minimal de la fenêtre (unités, défaut 8). */
  coteMin?: number;
}

const TAILLE = 300;
const MARGE = 14;

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
const echapper = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function clipDroite(a: number, b: number, c: number, x0: number, x1: number, y0: number, y1: number): [P2, P2] | null {
  const pts: P2[] = [];
  const add = (p: P2) => {
    if (p.x >= x0 - 1e-9 && p.x <= x1 + 1e-9 && p.y >= y0 - 1e-9 && p.y <= y1 + 1e-9 && !pts.some((r) => Math.abs(r.x - p.x) < 1e-9 && Math.abs(r.y - p.y) < 1e-9)) pts.push(p);
  };
  if (b !== 0) {
    add({ x: x0, y: -(a * x0 + c) / b });
    add({ x: x1, y: -(a * x1 + c) / b });
  }
  if (a !== 0) {
    add({ x: -(b * y0 + c) / a, y: y0 });
    add({ x: -(b * y1 + c) / a, y: y1 });
  }
  return pts.length >= 2 ? [pts[0], pts[1]] : null;
}

export function figureLieux(o: ObjetsLieux): string {
  let x0: number, x1: number, y0: number, y1: number;
  if (o.fenetre) {
    ({ xmin: x0, xmax: x1, ymin: y0, ymax: y1 } = o.fenetre);
    const cote = Math.max(x1 - x0, y1 - y0);
    x0 -= (cote - (x1 - x0)) / 2;
    x1 = x0 + cote;
    y0 -= (cote - (y1 - y0)) / 2;
    y1 = y0 + cote;
  } else {
    const xs: number[] = [0];
    const ys: number[] = [0];
    const prendre = (p: P2) => {
      xs.push(p.x);
      ys.push(p.y);
    };
    o.points?.forEach((p) => prendre(p.p));
    o.inclure?.forEach(prendre);
    o.segments?.forEach((s) => (prendre(s.a), prendre(s.b)));
    o.demiDroites?.forEach((s) => prendre(s.o));
    o.polygones?.forEach((pg) => pg.pts.forEach(prendre));
    o.cercles?.forEach((c) => (prendre({ x: c.c.x - c.r, y: c.c.y - c.r }), prendre({ x: c.c.x + c.r, y: c.c.y + c.r })));
    x0 = Math.floor(Math.min(...xs)) - 1;
    x1 = Math.ceil(Math.max(...xs)) + 1;
    y0 = Math.floor(Math.min(...ys)) - 1;
    y1 = Math.ceil(Math.max(...ys)) + 1;
    const cote = Math.max(o.coteMin ?? 8, x1 - x0, y1 - y0);
    x0 -= Math.floor((cote - (x1 - x0)) / 2);
    x1 = x0 + cote;
    y0 -= Math.floor((cote - (y1 - y0)) / 2);
    y1 = y0 + cote;
  }
  const cote = x1 - x0;
  const u = (TAILLE - 2 * MARGE) / cote;
  const X = (x: number) => MARGE + (x - x0) * u;
  const Y = (y: number) => MARGE + (y1 - y) * u;
  const parts: string[] = [`<rect x="0" y="0" width="${TAILLE}" height="${TAILLE}" fill="#ffffff"/>`];

  // Quadrillage.
  const pasGrille = cote <= 24 ? 1 : cote <= 48 ? 2 : 5;
  const pasNombre = cote <= 12 ? 2 : cote <= 24 ? 5 : 10;
  for (let x = Math.ceil(x0 / pasGrille) * pasGrille; x <= x1 + 1e-9; x += pasGrille) {
    const axe = Math.abs(x) < 1e-9;
    parts.push(`<line x1="${f1(X(x))}" y1="${f1(Y(y0))}" x2="${f1(X(x))}" y2="${f1(Y(y1))}" stroke="${axe ? "#495057" : "#e9ecef"}" stroke-width="${axe ? 1.2 : 0.7}"/>`);
  }
  for (let y = Math.ceil(y0 / pasGrille) * pasGrille; y <= y1 + 1e-9; y += pasGrille) {
    const axe = Math.abs(y) < 1e-9;
    parts.push(`<line x1="${f1(X(x0))}" y1="${f1(Y(y))}" x2="${f1(X(x1))}" y2="${f1(Y(y))}" stroke="${axe ? "#495057" : "#e9ecef"}" stroke-width="${axe ? 1.2 : 0.7}"/>`);
  }

  // Régions (sous les traits).
  for (const b of o.bandes ?? []) {
    const col = COULEURS_LIEUX[b.couleur ?? "vert"];
    if (b.sens === "verticale") parts.push(`<rect x="${f1(X(b.min))}" y="${f1(Y(y1))}" width="${f1((b.max - b.min) * u)}" height="${f1(cote * u)}" fill="${col}" fill-opacity="0.18"/>`);
    else parts.push(`<rect x="${f1(X(x0))}" y="${f1(Y(b.max))}" width="${f1(cote * u)}" height="${f1((b.max - b.min) * u)}" fill="${col}" fill-opacity="0.18"/>`);
  }
  for (const pg of o.polygones ?? []) {
    const col = COULEURS_LIEUX[pg.couleur ?? "vert"];
    const pts = pg.pts.map((p) => `${f1(X(p.x))},${f1(Y(p.y))}`).join(" ");
    parts.push(`<polygon points="${pts}" fill="${pg.rempli ? col : "none"}" fill-opacity="${pg.rempli ? 0.2 : 0}" stroke="${pg.trait === false ? "none" : col}" stroke-width="2.4" stroke-linejoin="round"/>`);
  }

  const trait = (col: CouleurLieux | undefined, defaut: CouleurLieux, pointilles?: boolean, epais?: boolean) =>
    `stroke="${COULEURS_LIEUX[col ?? defaut]}" stroke-width="${epais ? 3 : 1.8}"${pointilles ? ' stroke-dasharray="6 4"' : ""} fill="none"`;

  const obstacles: Boite[] = [];
  for (const c of o.cercles ?? []) parts.push(`<circle cx="${f1(X(c.c.x))}" cy="${f1(Y(c.c.y))}" r="${f1(c.r * u)}" ${trait(c.couleur, "bleu", c.pointilles, c.epais)}/>`);
  const nomsDroites: string[] = [];
  for (const d of o.droites ?? []) {
    const seg = clipDroite(d.a, d.b, d.c, x0, x1, y0, y1);
    if (!seg) continue;
    parts.push(`<line x1="${f1(X(seg[0].x))}" y1="${f1(Y(seg[0].y))}" x2="${f1(X(seg[1].x))}" y2="${f1(Y(seg[1].y))}" ${trait(d.couleur, "accent", d.pointilles, d.epais)}/>`);
    if (d.nom) {
      // Nom près de l'extrémité la plus haute à droite, rentré dans le cadre.
      const e = seg[0].x + seg[0].y > seg[1].x + seg[1].y ? seg[0] : seg[1];
      const l = largeurTexte(d.nom, 12) + 4;
      const tx = Math.min(Math.max(X(e.x), MARGE + l / 2), TAILLE - MARGE - l / 2);
      const ty = Math.min(Math.max(Y(e.y) + 13, MARGE + 12), TAILLE - MARGE - 2);
      obstacles.push(boiteTexte(tx, ty, d.nom, 12, "middle"));
      nomsDroites.push(`<text x="${f1(tx)}" y="${f1(ty)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS_LIEUX[d.couleur ?? "accent"]}" font-family="serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echapper(d.nom)}</text>`);
    }
  }
  for (const s of o.demiDroites ?? []) {
    const n = Math.hypot(s.u.x, s.u.y) || 1;
    const loin = { x: s.o.x + (s.u.x / n) * cote * 3, y: s.o.y + (s.u.y / n) * cote * 3 };
    parts.push(`<line x1="${f1(X(s.o.x))}" y1="${f1(Y(s.o.y))}" x2="${f1(X(loin.x))}" y2="${f1(Y(loin.y))}" ${trait(s.couleur, "vert", false, s.epais)}/>`);
  }
  for (const c of o.courbes ?? []) {
    const visibles = c.pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (visibles.length < 2) continue;
    parts.push(`<polyline points="${visibles.map((p) => `${f1(X(p.x))},${f1(Y(Math.max(y0 - cote, Math.min(y1 + cote, p.y))))}`).join(" ")}" ${trait(c.couleur, "vert", c.pointilles, c.epais)} stroke-linejoin="round"/>`);
  }
  for (const s of o.segments ?? []) parts.push(`<line x1="${f1(X(s.a.x))}" y1="${f1(Y(s.a.y))}" x2="${f1(X(s.b.x))}" y2="${f1(Y(s.b.y))}" ${trait(s.couleur, "encre", s.pointilles, s.epais)}/>`);
  for (const a of o.anglesDroits ?? []) {
    const unit = (p: P2) => {
      const dx = p.x - a.sommet.x;
      const dy = p.y - a.sommet.y;
      const n = Math.hypot(dx, dy) || 1;
      return { x: dx / n, y: dy / n };
    };
    const t = 8 / u;
    const v1 = unit(a.vers1);
    const v2 = unit(a.vers2);
    const p1 = { x: a.sommet.x + v1.x * t, y: a.sommet.y + v1.y * t };
    const p2 = { x: a.sommet.x + (v1.x + v2.x) * t, y: a.sommet.y + (v1.y + v2.y) * t };
    const p3 = { x: a.sommet.x + v2.x * t, y: a.sommet.y + v2.y * t };
    parts.push(`<polyline points="${f1(X(p1.x))},${f1(Y(p1.y))} ${f1(X(p2.x))},${f1(Y(p2.y))} ${f1(X(p3.x))},${f1(Y(p3.y))}" fill="none" stroke="${COULEURS_LIEUX.encre}" stroke-width="1"/>`);
  }

  // Points et noms (rentrés dans le cadre).
  const etiquettes: string[] = [];
  for (const p of o.points ?? []) {
    const col = COULEURS_LIEUX[p.couleur ?? "encre"];
    const px = X(p.p.x);
    const py = Y(p.p.y);
    if (px < -1 || px > TAILLE + 1 || py < -1 || py > TAILLE + 1) continue;
    obstacles.push(boiteDisque(px, py, 3.4));
    parts.push(p.creux ? `<circle cx="${f1(px)}" cy="${f1(py)}" r="3.6" fill="#ffffff" stroke="${col}" stroke-width="1.8"/>` : `<circle cx="${f1(px)}" cy="${f1(py)}" r="3.4" fill="${col}"/>`);
    if (!p.nom) continue;
    const taille = 13;
    const l = largeurTexte(p.nom, taille) + 2;
    const essais: ("ne" | "no" | "se" | "so")[] = p.position ? [p.position, "ne", "no", "se", "so"] : ["ne", "no", "se", "so"];
    let choisi: { tx: number; ty: number; ancre: "start" | "end" } | null = null;
    for (const pos of essais) {
      const ancre = pos.endsWith("e") ? "start" : "end";
      let tx = px + (ancre === "start" ? 5 : -5);
      let ty = py + (pos.startsWith("n") ? -6 : 15);
      tx = ancre === "start" ? Math.min(tx, TAILLE - 3 - l) : Math.max(tx, 3 + l);
      ty = Math.min(Math.max(ty, 13), TAILLE - 4);
      const b = boiteTexte(tx, ty, p.nom, taille, ancre);
      if (!obstacles.some((ob) => chevauche(ob, b)) || pos === essais[essais.length - 1]) {
        choisi = { tx, ty, ancre };
        obstacles.push(b);
        break;
      }
    }
    if (choisi) etiquettes.push(`<text x="${f1(choisi.tx)}" y="${f1(choisi.ty)}" font-size="${taille}" font-weight="600" text-anchor="${choisi.ancre}" fill="${col}" font-family="serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echapper(p.nom)}</text>`);
  }

  // Nombres des axes (jamais sur un point ou un nom).
  const grads: Graduation[] = [];
  const yAxe = Math.min(Math.max(Y(0), MARGE), TAILLE - MARGE);
  const xAxe = Math.min(Math.max(X(0), MARGE), TAILLE - MARGE);
  for (let x = Math.ceil(x0 / pasNombre) * pasNombre; x < x1; x += pasNombre) {
    if (Math.abs(x) < 1e-9 || x <= x0) continue;
    const yt = Math.min(yAxe + 11, TAILLE - 3);
    grads.push({ valeur: x, x: X(x), y: yt, xRepli: X(x), yRepli: Math.max(yAxe - 4, 10), ancre: "middle", ancreRepli: "middle" });
  }
  for (let y = Math.ceil(y0 / pasNombre) * pasNombre; y < y1; y += pasNombre) {
    if (Math.abs(y) < 1e-9 || y <= y0) continue;
    grads.push({ valeur: y, x: Math.max(xAxe - 3, 16), y: Y(y) + 3, xRepli: Math.min(xAxe + 3, TAILLE - 16), yRepli: Y(y) + 3, ancre: "end", ancreRepli: "start" });
  }
  if (x0 < 0 && x1 > 0 && y0 < 0 && y1 > 0) grads.push({ valeur: 0, x: X(0) - 3, y: Y(0) + 11, xRepli: X(0) + 3, yRepli: Y(0) - 4, ancre: "end", ancreRepli: "start" });
  parts.push(`<g font-family="sans-serif">${graduationsSansChevauchement(grads, obstacles, { taille: 9, couleur: "#495057" })}</g>`);
  parts.push(...nomsDroites, ...etiquettes);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE}" height="${TAILLE}" viewBox="0 0 ${TAILLE} ${TAILLE}" role="img" style="max-width:100%;height:auto">${parts.join("")}</svg>`;
}

/** Échantillonne une courbe y = f(x) (ou paramétrée) entre deux bornes. */
export function echantillonner(fn: (s: number) => P2, debut: number, fin: number, n = 120): P2[] {
  const r: P2[] = [];
  for (let i = 0; i <= n; i++) r.push(fn(debut + ((fin - debut) * i) / n));
  return r;
}
