import type { Pt } from "../core5e/stat2vLotH1";
import { nT } from "./ecrituresStat2vLotH1";

/**
 * Nuage de points du lot H1 du 5e ch. 6 : repère « bien choisi » (graduations régulières au pas 1, 2 ou
 * 5 × 10ᵏ ; un axe qui ne commence pas à 0 est marqué d'une brisure ⫽ près de l'origine, comme le dit la
 * méthode du cours), titres des axes, points du nuage, points remarquables (G, G₁, G₂ : croix carrée
 * étiquetée) et droites d'ajustement rognées au cadre (calcul du segment, AUCUN identifiant ni
 * `clipPath`). Chaîne SVG autonome : la même à l'écran, sur papier (`enteteHtml`) et dans le corrigé
 * (`figureHtml`). Fond blanc et couleurs fixes (lisible en clair, en sombre et à l'impression).
 */

export interface PointRemarquable {
  P: Pt;
  nom: string;
  couleur?: string;
}

export interface DroiteNuage {
  a: number;
  b: number;
  couleur?: string;
  pointilles?: boolean;
  nom?: string;
}

export interface SpecNuage {
  points: readonly Pt[];
  titreX?: string;
  titreY?: string;
  remarquables?: PointRemarquable[];
  droites?: DroiteNuage[];
  /** Courbes d'ajustement non affines (corrigé de 5gen76 : parabole, exponentielle), rognées au cadre. */
  courbes?: { f: (x: number) => number; couleur?: string }[];
  /** Fenêtre imposée (sinon : autour des points, remarquables compris). */
  fenetre?: { xmin: number; xmax: number; ymin: number; ymax: number };
  largeur?: number;
  hauteur?: number;
  /** Numéro (ou lettre) écrit en gros en haut à gauche (associer des nuages). */
  numero?: string;
  /** Pas de graduations chiffrées (nuages « à l'œil » de 5gen76). */
  sansGraduations?: boolean;
}

export const COULEUR_POINT = "#1971c2";
export const COULEUR_G = "#c2410c";
export const COULEUR_G12 = "#2f9e44";
export const COULEUR_DROITE = "#c2410c";
const AXE = "#343a40";
const GRILLE = "#dee2e6";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';

const f1 = (v: number): string => (Math.round(v * 10) / 10).toString();

/** Pas « joli » (1, 2 ou 5 × 10ᵏ) pour environ `cible` graduations. */
export function pasJoli(etendue: number, cible = 6): number {
  const brut = etendue / cible;
  const p = 10 ** Math.floor(Math.log10(brut));
  const m = brut / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}

interface Axe {
  min: number;
  max: number;
  pas: number;
  brise: boolean;
}

function axeAutour(lo: number, hi: number, cible: number): Axe {
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const pas = pasJoli(hi - lo, cible);
  let min = Math.floor(lo / pas - 1e-9) * pas;
  let max = Math.ceil(hi / pas + 1e-9) * pas;
  if (min === lo) min -= pas;
  if (max === hi) max += pas;
  // Proche de 0 : on part de 0 (pas de brisure inutile).
  let brise = false;
  if (min > 0) {
    if (min <= 2 * pas) min = 0;
    else brise = true;
  } else if (max < 0) {
    if (max >= -2 * pas) max = 0;
    else brise = true;
  }
  return { min, max, pas, brise };
}

const nPas = (v: number, pas: number): string => nT(Math.round(v / pas) * pas, Math.max(0, -Math.floor(Math.log10(pas) + 1e-9)));

/** Segment de la droite y = ax + b dans le rectangle [x0 ; x1] × [y0 ; y1], ou `null`. */
function segmentDroite(a: number, b: number, x0: number, x1: number, y0: number, y1: number): [Pt, Pt] | null {
  let tMin = x0;
  let tMax = x1;
  if (Math.abs(a) < 1e-12) {
    if (b < y0 || b > y1) return null;
  } else {
    const xa = (y0 - b) / a;
    const xb = (y1 - b) / a;
    tMin = Math.max(tMin, Math.min(xa, xb));
    tMax = Math.min(tMax, Math.max(xa, xb));
    if (tMin >= tMax) return null;
  }
  return [
    { x: tMin, y: a * tMin + b },
    { x: tMax, y: a * tMax + b },
  ];
}

export function figureNuage(s: SpecNuage): string {
  const L = s.largeur ?? 340;
  const H = s.hauteur ?? 250;
  const tousX = [...s.points.map((p) => p.x), ...(s.remarquables ?? []).map((r) => r.P.x)];
  const tousY = [...s.points.map((p) => p.y), ...(s.remarquables ?? []).map((r) => r.P.y)];
  const fen = s.fenetre;
  const ax = fen ? { min: fen.xmin, max: fen.xmax, pas: pasJoli(fen.xmax - fen.xmin, 6), brise: fen.xmin > 0 } : axeAutour(Math.min(...tousX), Math.max(...tousX), L > 260 ? 6 : 4);
  const ay = fen ? { min: fen.ymin, max: fen.ymax, pas: pasJoli(fen.ymax - fen.ymin, 5), brise: fen.ymin > 0 } : axeAutour(Math.min(...tousY), Math.max(...tousY), 5);
  const gauche = s.sansGraduations ? 18 : 46;
  const bas = s.sansGraduations ? 18 : 34;
  const haut = s.titreY ? 22 : 12;
  const droite = 12;
  const W = L - gauche - droite;
  const Hh = H - haut - bas;
  const X = (x: number) => gauche + ((x - ax.min) / (ax.max - ax.min)) * W;
  const Y = (y: number) => haut + Hh - ((y - ay.min) / (ay.max - ay.min)) * Hh;
  const o: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  // Quadrillage aux graduations.
  for (let v = ax.min; v <= ax.max + 1e-9; v += ax.pas) o.push(`<line x1="${f1(X(v))}" y1="${haut}" x2="${f1(X(v))}" y2="${haut + Hh}" stroke="${GRILLE}" stroke-width="1"/>`);
  for (let v = ay.min; v <= ay.max + 1e-9; v += ay.pas) o.push(`<line x1="${gauche}" y1="${f1(Y(v))}" x2="${gauche + W}" y2="${f1(Y(v))}" stroke="${GRILLE}" stroke-width="1"/>`);
  // Axes (le long du bord bas et gauche du cadre), flèches.
  o.push(`<line x1="${gauche}" y1="${haut + Hh}" x2="${gauche + W + 6}" y2="${haut + Hh}" stroke="${AXE}" stroke-width="1.3"/>`);
  o.push(`<polygon points="${gauche + W + 9},${haut + Hh} ${gauche + W + 3},${haut + Hh - 3.5} ${gauche + W + 3},${haut + Hh + 3.5}" fill="${AXE}"/>`);
  o.push(`<line x1="${gauche}" y1="${haut + Hh}" x2="${gauche}" y2="${haut - 6}" stroke="${AXE}" stroke-width="1.3"/>`);
  o.push(`<polygon points="${gauche},${haut - 9} ${gauche - 3.5},${haut - 3} ${gauche + 3.5},${haut - 3}" fill="${AXE}"/>`);
  // Brisures (axe qui ne commence pas à 0).
  const zig = (x: number, y: number, horizontal: boolean) =>
    horizontal
      ? `<path d="M${f1(x - 6)},${f1(y)} l3,-4 l3,8 l3,-8 l3,4" fill="none" stroke="${AXE}" stroke-width="1.2"/>`
      : `<path d="M${f1(x)},${f1(y + 6)} l-4,-3 l8,-3 l-8,-3 l4,-3" fill="none" stroke="${AXE}" stroke-width="1.2"/>`;
  if (!s.sansGraduations) {
    if (ax.brise) o.push(`<rect x="${gauche + 6}" y="${haut + Hh - 4}" width="12" height="8" fill="#ffffff"/>`, zig(gauche + 12, haut + Hh, true));
    if (ay.brise) o.push(`<rect x="${gauche - 4}" y="${haut + Hh - 18}" width="8" height="12" fill="#ffffff"/>`, zig(gauche, haut + Hh - 12, false));
    const p = 10.5;
    let premier = true;
    for (let v = ax.min; v <= ax.max + 1e-9; v += ax.pas) {
      if (ax.brise && premier) {
        premier = false;
        continue;
      }
      premier = false;
      o.push(`<line x1="${f1(X(v))}" y1="${haut + Hh}" x2="${f1(X(v))}" y2="${haut + Hh + 4}" stroke="${AXE}"/>`);
      o.push(`<text x="${f1(X(v))}" y="${haut + Hh + 15}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE}>${nPas(v, ax.pas)}</text>`);
    }
    premier = true;
    for (let v = ay.min; v <= ay.max + 1e-9; v += ay.pas) {
      if (ay.brise && premier) {
        premier = false;
        continue;
      }
      premier = false;
      o.push(`<line x1="${gauche - 4}" y1="${f1(Y(v))}" x2="${gauche}" y2="${f1(Y(v))}" stroke="${AXE}"/>`);
      o.push(`<text x="${gauche - 6}" y="${f1(Y(v) + 3.5)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE}>${nPas(v, ay.pas)}</text>`);
    }
  }
  if (s.titreX) o.push(`<text x="${gauche + W}" y="${H - 4}" font-size="10.5" text-anchor="end" fill="${AXE}" ${POLICE}>${echapper(s.titreX)}</text>`);
  if (s.titreY) o.push(`<text x="${gauche + 6}" y="${haut - 9}" font-size="10.5" text-anchor="start" fill="${AXE}" ${POLICE}>${echapper(s.titreY)}</text>`);
  if (!s.titreX && !s.sansGraduations) o.push(`<text x="${gauche + W + 4}" y="${haut + Hh - 6}" font-size="12" font-style="italic" text-anchor="end" fill="${AXE}" font-family="Times New Roman, serif">x</text>`);
  if (!s.titreY) o.push(`<text x="${gauche + 6}" y="${haut + 4}" font-size="12" font-style="italic" fill="${AXE}" font-family="Times New Roman, serif">y</text>`);
  if (s.sansGraduations && !s.titreX) o.push(`<text x="${gauche + W + 4}" y="${haut + Hh - 6}" font-size="12" font-style="italic" text-anchor="end" fill="${AXE}" font-family="Times New Roman, serif">x</text>`);
  // Droites.
  for (const d of s.droites ?? []) {
    const seg = segmentDroite(d.a, d.b, ax.min, ax.max, ay.min, ay.max);
    if (!seg) continue;
    o.push(`<line x1="${f1(X(seg[0].x))}" y1="${f1(Y(seg[0].y))}" x2="${f1(X(seg[1].x))}" y2="${f1(Y(seg[1].y))}" stroke="${d.couleur ?? COULEUR_DROITE}" stroke-width="1.8"${d.pointilles ? ' stroke-dasharray="6 4"' : ""}/>`);
  }
  // Courbes (morceaux dans la fenêtre seulement).
  for (const c of s.courbes ?? []) {
    let d = "";
    let dedans = false;
    for (let i = 0; i <= 120; i++) {
      const x = ax.min + ((ax.max - ax.min) * i) / 120;
      const y = c.f(x);
      if (!Number.isFinite(y) || y < ay.min || y > ay.max) {
        dedans = false;
        continue;
      }
      d += `${dedans ? "L" : "M"}${f1(X(x))},${f1(Y(y))} `;
      dedans = true;
    }
    if (d) o.push(`<path d="${d.trim()}" fill="none" stroke="${c.couleur ?? COULEUR_DROITE}" stroke-width="1.8"/>`);
  }
  // Points du nuage.
  for (const q of s.points) o.push(`<circle cx="${f1(X(q.x))}" cy="${f1(Y(q.y))}" r="3.3" fill="${COULEUR_POINT}" stroke="#ffffff" stroke-width="0.8"/>`);
  // Points remarquables : carré évidé + croix, étiquette décalée.
  for (const r of s.remarquables ?? []) {
    const cx = X(r.P.x);
    const cy = Y(r.P.y);
    const c = r.couleur ?? COULEUR_G;
    o.push(`<rect x="${f1(cx - 4.5)}" y="${f1(cy - 4.5)}" width="9" height="9" fill="#ffffff" stroke="${c}" stroke-width="1.8"/>`);
    o.push(`<path d="M${f1(cx - 4.5)},${f1(cy - 4.5)} L${f1(cx + 4.5)},${f1(cy + 4.5)} M${f1(cx + 4.5)},${f1(cy - 4.5)} L${f1(cx - 4.5)},${f1(cy + 4.5)}" stroke="${c}" stroke-width="1.4"/>`);
    const versGauche = cx > gauche + W - 40;
    const versBas = cy < haut + 16;
    o.push(
      `<text x="${f1(cx + (versGauche ? -8 : 8))}" y="${f1(cy + (versBas ? 16 : -7))}" font-size="12" font-weight="600" text-anchor="${versGauche ? "end" : "start"}" fill="${c}" stroke="#ffffff" stroke-width="3" paint-order="stroke" ${POLICE}>${nomSvg(r.nom)}</text>`,
    );
  }
  if (s.numero) o.push(`<text x="${gauche + 8}" y="${haut + 16}" font-size="16" font-weight="700" fill="${AXE}" stroke="#ffffff" stroke-width="3" paint-order="stroke" ${POLICE}>${echapper(s.numero)}</text>`);
  o.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="nuage-stat2v" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage de points">${o.join("")}</svg>`;
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** « G1 » → G avec indice 1 (tspan). */
function nomSvg(nom: string): string {
  const m = /^([A-Z])(\d)$/.exec(nom);
  if (!m) return echapper(nom);
  return `${m[1]}<tspan font-size="9" dy="3">${m[2]}</tspan>`;
}

/** Plusieurs nuages côte à côte (deux par rangée) : associer des nuages à des coefficients. */
export function planche(svgs: string[], colonnes = 2): string {
  const mesures = svgs.map((s) => {
    const m = /width="([\d.]+)" height="([\d.]+)"/.exec(s);
    return { l: Number(m?.[1] ?? 160), h: Number(m?.[2] ?? 140) };
  });
  const l = Math.max(...mesures.map((m) => m.l));
  const h = Math.max(...mesures.map((m) => m.h));
  const ecart = 8;
  const LT = colonnes * l + (colonnes - 1) * ecart;
  const lignes = Math.ceil(svgs.length / colonnes);
  const HT = lignes * h + (lignes - 1) * ecart;
  const corps = svgs
    .map((s, i) => s.replace(/^<svg [^>]*?width="([\d.]+)" height="([\d.]+)"/, `<svg x="${(i % colonnes) * (l + ecart)}" y="${Math.floor(i / colonnes) * (h + ecart)}" width="$1" height="$2"`))
    .join("");
  return `<svg class="nuages-stat2v" width="${LT}" height="${HT}" viewBox="0 0 ${LT} ${HT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuages de points">${corps}</svg>`;
}
