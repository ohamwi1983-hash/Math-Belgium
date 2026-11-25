import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { D, Fenetre, Poly, Pt, SpecFigure } from "./outilsLieuxLotH2";
import { COULEURS, coordL, entier, evalPoly, figureRepere, l, melanger, nL, normaliserPoly, parmi, pgcd, polyL, t } from "./outilsLieuxLotH2";
import { egalNum, lireNombre } from "../moteur6e/lectureLieuxLotH2";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Outils communs du lot H2 du 6e ch. 10 « Les coniques » (6gen138 tangente par la dérivée et forme
 * dédoublée, 6gen139 position d'une droite selon un paramètre, 6gen140 miroirs en contexte, 6gen141
 * Kepler, 6gen142 LORAN, 6gen143 détective). SOURCE UNIQUE pour l'écran, les aides, le papier et le
 * corrigé : coniques réduites du cours (ellipse x²/a² + y²/b² = 1, hyperbole x²/a² − y²/b² = 1, parabole
 * y² = 2px avec p = dist(F ; d), convention de la 4e), écritures LaTeX, lecture des saisies (valeurs
 * « ± », mesures avec unité, valeur approchée refusée sans tentative) et figures : repère quadrillé de
 * `outilsLieuxLotH2` (même échelle sur les deux axes) pour les exercices en repère, schéma sans quadrillage
 * (`figureSchema`, même échelle sur les deux axes) pour les situations concrètes (antenne, orbite, LORAN).
 * Module propre au lot : la figure de coniques des lots BC / H1 n'est pas encore fusionnée.
 */

export type { D, Fenetre, Poly, Pt, SpecFigure };
export { COULEURS, coordL, entier, evalPoly, figureRepere, l, melanger, nL, normaliserPoly, parmi, pgcd, polyL, t };

/** Dénominateur d'un rationnel (≤ 20 000). */
function denominateur(v: number): number {
  for (let d = 1; d <= 20000; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9 * Math.max(1, Math.abs(v * d))) return d;
  return 1;
}

/** Droite ax + by + c = 0 à coefficients entiers premiers entre eux (premier coefficient non nul positif).
 * La normalisation de `outilsLieuxLotH2` cherche un multiplicateur ≤ 60 : insuffisant pour une tangente
 * dédoublée (coefficients x_P/a², y_P/b² : dénominateurs jusqu'à quelques milliers). */
export function normaliserDroite(d: D): D {
  const vals = [d.a, d.b, d.c];
  let k = 1;
  for (const v of vals) {
    const q = denominateur(v);
    k = (k / pgcd(k, q)) * q;
  }
  const ent = vals.map((v) => Math.round(v * k));
  const g = ent.reduce((u, w) => pgcd(u, w), 0) || 1;
  const premier = ent.find((v) => v !== 0) ?? 1;
  const s = premier < 0 ? -1 : 1;
  return { a: (s * ent[0]!) / g, b: (s * ent[1]!) / g, c: (s * ent[2]!) / g };
}

/** « \dfrac{x^2}{25} », ou « x^2 » si le dénominateur vaut 1. */
export const carreSurL = (v: string, n: number): string => (n === 1 ? `${v}^2` : `\\dfrac{${v}^2}{${milliersL(n)}}`);

export type Conique = { type: "ellipse"; a: number; b: number } | { type: "hyperbole"; a: number; b: number } | { type: "parabole"; p: number };

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

const net = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v);

/** Entier avec espaces de milliers (« 10\,000 » en LaTeX). */
export function milliersL(v: number): string {
  const n = net(v);
  if (!Number.isInteger(n) || Math.abs(n) < 10000) return nL(n);
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
  return `${n < 0 ? "-" : ""}${s}`;
}
/** Même nombre en texte brut (« 10 000 », « 37,5 », « − »). */
export function milliersT(v: number): string {
  const n = net(v);
  const abs = Math.abs(n);
  let s: string;
  if (Number.isInteger(abs)) s = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  else s = String(Math.round(abs * 1000) / 1000).replace(".", ",");
  return `${n < 0 ? "−" : ""}${s}`;
}
/** Coefficient devant une lettre (« », « - », « 3 », « \dfrac{3}{4} »). */
export function coefL(k: number): string {
  const n = net(k);
  if (n === 1) return "";
  if (n === -1) return "-";
  return nL(n);
}
/** Terme signé « +3x », « -x », « » (premier terme sans « + »). */
export function termeL(k: number, partie: string, premier = false): string {
  const n = net(k);
  if (n === 0) return "";
  const abs = Math.abs(n);
  const c = partie && abs === 1 ? "" : milliersL(abs);
  return `${n < 0 ? "-" : premier ? "" : "+"}${c}${partie}`;
}
/** Nombre précédé de son signe (« +3 », « -\dfrac12 », « » si nul). */
export const sgL = (v: number): string => (net(v) === 0 ? "" : net(v) > 0 ? `+${nL(v)}` : `-${nL(-v)}`);
/** « (x-3) », « x », « (x+2) ». */
export const parL = (v: string, c: number): string => (net(c) === 0 ? v : `(${v}${sgL(-c)})`);
/** Base d'une puissance : entre parenthèses si négative ou fractionnaire (« \\left(\\dfrac{24}{5}\\right) »). */
export function pL(v: number): string {
  const s = nL(v);
  return net(v) < 0 || /frac|sqrt/.test(s) ? `\\left(${s}\\right)` : s;
}
/** Nombre entre parenthèses s'il est négatif. */
export const nPL = (v: number): string => (net(v) < 0 ? `(${nL(v)})` : nL(v));

/** Rationnel « simple » (dénominateur ≤ 400). */
export function estRationnel(v: number): boolean {
  for (let d = 1; d <= 400; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return true;
  return false;
}
/** Carré parfait d'un rationnel simple. */
export function estCarreRationnel(v: number): boolean {
  if (v < -1e-12) return false;
  return estRationnel(Math.sqrt(Math.max(0, v)));
}

// ---------------------------------------------------------------------------------------------
// Coniques
// ---------------------------------------------------------------------------------------------

/** Équation réduite du cours. */
export function equationConiqueL(c: Conique): string {
  if (c.type === "parabole") return `y^2=${nL(2 * c.p)}x`;
  const s = c.type === "ellipse" ? "+" : "-";
  return `${carreSurL("x", c.a * c.a)}${s}${carreSurL("y", c.b * c.b)}=1`;
}

/** Polynôme de la conique (comparaisons par proportionnalité). */
export function polyConique(c: Conique): Poly {
  if (c.type === "parabole") return { y2: 1, x: -2 * c.p };
  const a2 = c.a * c.a;
  const b2 = c.b * c.b;
  return c.type === "ellipse" ? { x2: b2, y2: a2, "1": -a2 * b2 } : { x2: b2, y2: -a2, "1": -a2 * b2 };
}

export function surConique(c: Conique, P: Pt, eps = 1e-9): boolean {
  if (c.type === "parabole") return Math.abs(P.y * P.y - 2 * c.p * P.x) < eps * (1 + P.y * P.y);
  const v = (P.x * P.x) / (c.a * c.a) + ((c.type === "ellipse" ? 1 : -1) * P.y * P.y) / (c.b * c.b);
  return Math.abs(v - 1) < eps;
}

/** Demi-distance focale c (ellipse : axe focal porté par le plus grand demi-axe). */
export function cFocal(c: Conique): number {
  if (c.type === "parabole") return c.p / 2;
  return c.type === "ellipse" ? Math.sqrt(Math.abs(c.a * c.a - c.b * c.b)) : Math.sqrt(c.a * c.a + c.b * c.b);
}

/** Tangente en un point de la conique, par la forme dédoublée (droite ax + by + c = 0). */
export function tangenteDedoublee(c: Conique, P: Pt): D {
  if (c.type === "parabole") return normaliserDroite({ a: -c.p, b: P.y, c: -c.p * P.x });
  const s = c.type === "ellipse" ? 1 : -1;
  return normaliserDroite({ a: P.x / (c.a * c.a), b: (s * P.y) / (c.b * c.b), c: -1 });
}

/** Points de la conique dans une fenêtre (une liste par branche). */
export function branchesConique(c: Conique, f: Fenetre, n = 240): Pt[][] {
  if (c.type === "ellipse") {
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const a = (2 * Math.PI * i) / n;
      pts.push({ x: c.a * Math.cos(a), y: c.b * Math.sin(a) });
    }
    return [pts];
  }
  if (c.type === "parabole") {
    const ymax = Math.max(Math.abs(f.yMin), Math.abs(f.yMax)) + 1;
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const y = -ymax + (2 * ymax * i) / n;
      pts.push({ x: (y * y) / (2 * c.p), y });
    }
    return [pts];
  }
  const tmax = Math.acosh(Math.max(1.0001, (Math.max(Math.abs(f.xMin), Math.abs(f.xMax)) + 1) / c.a)) + 0.2;
  const tmaxY = Math.asinh((Math.max(Math.abs(f.yMin), Math.abs(f.yMax)) + 1) / c.b) + 0.2;
  const T = Math.max(tmax, tmaxY);
  const droite: Pt[] = [];
  const gauche: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const s = -T + (2 * T * i) / n;
    droite.push({ x: c.a * Math.cosh(s), y: c.b * Math.sinh(s) });
    gauche.push({ x: -c.a * Math.cosh(s), y: c.b * Math.sinh(s) });
  }
  return [droite, gauche];
}

/** Fenêtre entière couvrant des points, au moins `min` unités par axe. */
export function fenetrePoints(points: Pt[], marge = 1, min = 6): Fenetre {
  let xMin = Math.floor(Math.min(...points.map((p) => p.x)) - marge);
  let xMax = Math.ceil(Math.max(...points.map((p) => p.x)) + marge);
  let yMin = Math.floor(Math.min(...points.map((p) => p.y)) - marge);
  let yMax = Math.ceil(Math.max(...points.map((p) => p.y)) + marge);
  xMin = Math.min(xMin, -1);
  yMin = Math.min(yMin, -1);
  xMax = Math.max(xMax, 1);
  yMax = Math.max(yMax, 1);
  while (xMax - xMin < min) {
    xMax++;
    if (xMax - xMin < min) xMin--;
  }
  while (yMax - yMin < min) {
    yMax++;
    if (yMax - yMin < min) yMin--;
  }
  return { xMin, xMax, yMin, yMax };
}

/** Repère quadrillé (exercices en repère) : unité choisie pour tenir dans ≈ 320 px. */
export function figureConiqueRepere(spec: Omit<SpecFigure, "unite">): string {
  const f = spec.fenetre;
  const etendue = Math.max(f.xMax - f.xMin, f.yMax - f.yMin);
  const unite = Math.max(9, Math.min(28, Math.floor(320 / etendue)));
  return figureRepere({ ...spec, unite, graduationsLisibles: true });
}

// ---------------------------------------------------------------------------------------------
// Schéma sans quadrillage (situations concrètes)
// ---------------------------------------------------------------------------------------------

export interface SpecSchema {
  /** Fenêtre (unités du problème). */
  fenetre: Fenetre;
  /** Largeur cible du dessin (px). */
  largeur?: number;
  /** Hauteur maximale du dessin (px, défaut 380) : une figure haute est réduite. */
  hauteurMax?: number;
  axes?: boolean;
  courbes?: { points: Pt[]; couleur?: string; epaisseur?: number; pointille?: boolean }[];
  segments?: { A: Pt; B: Pt; couleur?: string; pointille?: boolean; fleche?: boolean; epaisseur?: number }[];
  points?: { P: Pt; label?: string; couleur?: string; position?: "ne" | "no" | "se" | "so" | "n" | "s" | "e" | "o"; creux?: boolean }[];
  /** Cotes : segment fin à double flèche et texte au milieu. */
  cotes?: { A: Pt; B: Pt; texte: string; decalage?: number }[];
  textes?: { P: Pt; texte: string; couleur?: string; ancre?: "start" | "middle" | "end" }[];
}

const NOIR = "#1b1d22";
const fmt = (v: number) => String(Math.round(v * 100) / 100);
const echap = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const DEC: Record<string, [number, number, "start" | "middle" | "end"]> = {
  ne: [6, -6, "start"],
  no: [-6, -6, "end"],
  se: [6, 14, "start"],
  so: [-6, 14, "end"],
  n: [0, -8, "middle"],
  s: [0, 17, "middle"],
  e: [8, 4, "start"],
  o: [-8, 4, "end"],
};

/** Schéma (même échelle sur les deux axes, sans quadrillage ni graduation) : aucun identifiant SVG. */
export function figureSchema(spec: SpecSchema): string {
  const f = spec.fenetre;
  const largeur = spec.largeur ?? 320;
  const m = 20;
  const u = Math.min((largeur - 2 * m) / (f.xMax - f.xMin), ((spec.hauteurMax ?? 380) - 2 * m) / (f.yMax - f.yMin));
  const W = (f.xMax - f.xMin) * u + 2 * m;
  const H = (f.yMax - f.yMin) * u + 2 * m;
  const X = (x: number) => m + (x - f.xMin) * u;
  const Y = (y: number) => m + (f.yMax - y) * u;
  const dans = (p: Pt) => p.x >= f.xMin - 1e-9 && p.x <= f.xMax + 1e-9 && p.y >= f.yMin - 1e-9 && p.y <= f.yMax + 1e-9;
  const parts: string[] = [`<rect x="0" y="0" width="${fmt(W)}" height="${fmt(H)}" fill="#ffffff"/>`];
  if (spec.axes) {
    if (f.yMin <= 0 && f.yMax >= 0) parts.push(`<line x1="${fmt(X(f.xMin))}" y1="${fmt(Y(0))}" x2="${fmt(X(f.xMax))}" y2="${fmt(Y(0))}" stroke="#9aa1ab" stroke-width="1"/>`);
    if (f.xMin <= 0 && f.xMax >= 0) parts.push(`<line x1="${fmt(X(0))}" y1="${fmt(Y(f.yMin))}" x2="${fmt(X(0))}" y2="${fmt(Y(f.yMax))}" stroke="#9aa1ab" stroke-width="1"/>`);
  }
  for (const c of spec.courbes ?? []) {
    let chemin = "";
    let ouvert = false;
    for (const p of c.points) {
      if (!dans(p)) {
        ouvert = false;
        continue;
      }
      chemin += `${ouvert ? "L" : "M"}${fmt(X(p.x))},${fmt(Y(p.y))} `;
      ouvert = true;
    }
    if (chemin) parts.push(`<path d="${chemin.trim()}" fill="none" stroke="${c.couleur ?? COULEURS.bleu}" stroke-width="${c.epaisseur ?? 2.2}"${c.pointille ? ' stroke-dasharray="6 4"' : ""}/>`);
  }
  for (const sg of spec.segments ?? []) {
    parts.push(`<line x1="${fmt(X(sg.A.x))}" y1="${fmt(Y(sg.A.y))}" x2="${fmt(X(sg.B.x))}" y2="${fmt(Y(sg.B.y))}" stroke="${sg.couleur ?? NOIR}" stroke-width="${sg.epaisseur ?? 1.6}"${sg.pointille ? ' stroke-dasharray="5 4"' : ""}/>`);
    if (sg.fleche) {
      const ax = X(sg.A.x), ay = Y(sg.A.y), bx = X(sg.B.x), by = Y(sg.B.y);
      const lg = Math.hypot(bx - ax, by - ay) || 1;
      const ux = (bx - ax) / lg, uy = (by - ay) / lg;
      const mx = (ax + bx) / 2 + ux * 5, my = (ay + by) / 2 + uy * 5;
      parts.push(`<polygon points="${fmt(mx)},${fmt(my)} ${fmt(mx - ux * 9 - uy * 4.5)},${fmt(my - uy * 9 + ux * 4.5)} ${fmt(mx - ux * 9 + uy * 4.5)},${fmt(my - uy * 9 - ux * 4.5)}" fill="${sg.couleur ?? NOIR}"/>`);
    }
  }
  for (const c of spec.cotes ?? []) {
    const ax = X(c.A.x), ay = Y(c.A.y), bx = X(c.B.x), by = Y(c.B.y);
    const lg = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / lg, ny = (bx - ax) / lg;
    const d = c.decalage ?? 12;
    const x1 = ax + nx * d, y1 = ay + ny * d, x2 = bx + nx * d, y2 = by + ny * d;
    parts.push(`<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${COULEURS.gris}" stroke-width="1"/>`);
    const ux = (bx - ax) / lg, uy = (by - ay) / lg;
    for (const [px, py, s] of [[x1, y1, 1], [x2, y2, -1]] as const) {
      parts.push(`<polygon points="${fmt(px)},${fmt(py)} ${fmt(px + s * (ux * 7 - uy * 3))},${fmt(py + s * (uy * 7 + ux * 3))} ${fmt(px + s * (ux * 7 + uy * 3))},${fmt(py + s * (uy * 7 - ux * 3))}" fill="${COULEURS.gris}"/>`);
    }
    const tx = (x1 + x2) / 2 + nx * 9, ty = (y1 + y2) / 2 + ny * 9 + 4;
    parts.push(`<text x="${fmt(tx)}" y="${fmt(ty)}" font-size="11.5" text-anchor="middle" fill="${COULEURS.gris}" font-family="sans-serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echap(c.texte)}</text>`);
  }
  for (const tx of spec.textes ?? []) {
    parts.push(`<text x="${fmt(X(tx.P.x))}" y="${fmt(Y(tx.P.y))}" font-size="11.5" text-anchor="${tx.ancre ?? "middle"}" fill="${tx.couleur ?? NOIR}" font-family="sans-serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echap(tx.texte)}</text>`);
  }
  for (const pt of spec.points ?? []) {
    if (!dans(pt.P)) continue;
    const cx = X(pt.P.x), cy = Y(pt.P.y);
    const couleur = pt.couleur ?? NOIR;
    parts.push(pt.creux ? `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="3.6" fill="#ffffff" stroke="${couleur}" stroke-width="1.6"/>` : `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="3.4" fill="${couleur}"/>`);
    if (pt.label) {
      let pos = pt.position ?? "ne";
      if (cx > W - 40 && pos.includes("e")) pos = pos.replace("e", "o") as typeof pos;
      if (cx < 40 && pos.includes("o")) pos = pos.replace("o", "e") as typeof pos;
      const [dx, dy, ancre] = DEC[pos]!;
      parts.push(`<text x="${fmt(cx + dx)}" y="${fmt(cy + dy)}" font-size="12.5" text-anchor="${ancre}" fill="${couleur}" font-family="sans-serif" font-weight="600" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echap(pt.label)}</text>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(W)}" height="${fmt(H)}" viewBox="0 0 ${fmt(W)} ${fmt(H)}" role="img">${parts.join("")}</svg>`;
}

// ---------------------------------------------------------------------------------------------
// Lecture des saisies (jamais de filtre : on lit ce qui est écrit)
// ---------------------------------------------------------------------------------------------

const UNITES = /\s*(millions?\s+de\s+km|millions?\s+de\s+kilom[eè]tres|km|cm|mm|m|ua|u\.a\.|µs|μs|unités?)\s*$/i;

/** Retire un préfixe recopié (« a = », « FP = », « e = ») et une unité finale. */
export function sansPrefixeNiUnite(saisie: string): string {
  return normaliserSigneMoins(saisie)
    .trim()
    .replace(/^[^=]*[A-Za-zΔ][^=]*=\s*/, "")
    .replace(UNITES, "")
    .trim();
}

/** Nombre (fraction, racine, virgule) avec préfixe et unité tolérés ; `null` si illisible. */
export function lireMesure(saisie: string): number | null {
  const s = sansPrefixeNiUnite(saisie);
  if (s === "") return null;
  return lireNombre(s);
}

/** Écriture décimale (« 0,6 », « 1.33 ») : sert à repérer une valeur approchée. */
export const ecritureDecimale = (saisie: string): boolean => /\d[.,]\d/.test(saisie);

/** Saisie décimale proche (≤ 1 %) d'une valeur qu'elle n'égale pas : valeur approchée. */
export function estApprochee(saisie: string, lue: number | null, attendue: number): boolean {
  if (lue === null || !ecritureDecimale(saisie) || egalNum(lue, attendue, 1e-9)) return false;
  return Math.abs(lue - attendue) <= 0.01 * Math.max(1, Math.abs(attendue));
}

const MOTS_AUCUNE = /^(aucune?s?( valeur(s)?| solution(s)?)?|pas de valeur|jamais|rien|vide|∅|\{\s*\})$/i;

/** Valeurs d'un paramètre : « 5 ; −5 », « ±5 », « k = ±√13 », « aucune » (→ []) ; `null` si illisible. */
export function lireValeurs(saisie: string): number[] | null {
  const s = normaliserSigneMoins(saisie).trim().replace(/^[A-Za-z][A-Za-z0-9_₀-₉]*\s*=\s*/, "");
  if (MOTS_AUCUNE.test(s)) return [];
  const morceaux = s
    .split(/;|\bou\b|\bet\b/i)
    .map((m) => m.trim().replace(/^[A-Za-z][A-Za-z0-9_₀-₉]*\s*=\s*/, ""))
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs: number[] = [];
  for (const m of morceaux) {
    if (/^(±|\+-|\+\/-)/.test(m)) {
      const v = lireNombre(m.replace(/^(±|\+-|\+\/-)\s*/, ""));
      if (v === null) return null;
      valeurs.push(v, -v);
    } else {
      const v = lireNombre(m);
      if (v === null) return null;
      valeurs.push(v);
    }
  }
  return valeurs;
}

/** Même ensemble de valeurs (ordre et doublons indifférents). */
export function memesValeurs(a: number[], b: number[]): boolean {
  const ua = [...new Set(a.map((v) => Math.round(v * 1e8) / 1e8))];
  const ub = [...new Set(b.map((v) => Math.round(v * 1e8) / 1e8))];
  if (ua.length !== ub.length) return false;
  return ua.every((v) => ub.some((w) => egalNum(v, w, 1e-8)));
}

/** Liste de valeurs en LaTeX (« \pm 5 », « \text{aucune} »). */
export function valeursL(vals: number[], lettre: string): string {
  if (vals.length === 0) return `\\text{aucune valeur de }${lettre}`;
  if (vals.length === 2 && egalNum(vals[0]!, -vals[1]!, 1e-9) && vals[0] !== 0) return `${lettre}=\\pm ${nL(Math.abs(vals[0]!))}`;
  return vals.map((v) => `${lettre}=${nL(v)}`).join("\\ \\text{ou}\\ ");
}

/** Fragments « texte » + « latex » courts. */
export function frags(...m: (string | { l: string })[]): Frag[] {
  return m.map((x) => (typeof x === "string" ? t(x) : l(x.l)));
}

/** Tire un élément et le retire (utile pour des choix distincts). */
export function tirerDistinct<T>(liste: readonly T[], exclus: (x: T) => boolean): T {
  const ok = liste.filter((x) => !exclus(x));
  return parmi(ok.length ? ok : liste);
}

export { egalNum, normaliserSigneMoins };
export const evalPolyPt = (p: Poly, P: Pt): number => evalPoly(p, P.x, P.y);
