import type { D, P } from "../ui6e/outilsLieuxLotH1";
import { choisir, droiteEntiere, entier, intersectionD } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen126` « Tangentes et position relative droite–cercle » (6e ch. 9, § 2,
 * Appliquer). Trois variantes :
 * - `position` : cercle en forme développée, droite ax + by + c = 0 de vecteur normal (3 ; 4), (5 ; 12)
 *   ou d'un axe (distance rationnelle) ; la POSITION (sécante, tangente, extérieure) est le verdict,
 *   tirée au tiers AVANT les nombres ; écrans centre et rayon, distance d(Ω ; d), position ;
 * - `tangentePoint` : tangente en un point T du cercle (forme développée) ; tangente verticale une
 *   fois sur quatre ; écrans centre, tangente ;
 * - `tangentesExterieur` : cercle (x − p)² + (y − q)² = r², point P extérieur choisi pour que PT soit
 *   entier et les pentes rationnelles ; une des deux tangentes est verticale une fois sur trois (tirée
 *   AVANT le reste) ; écrans PT, les deux tangentes (ordre libre).
 */

export type Variante126 = "position" | "tangentePoint" | "tangentesExterieur";
export type Position126 = "secante" | "tangente" | "exterieure";
export type Phase126 = "centreRayon" | "distance" | "position" | "centre" | "tangente" | "longueur" | "tangentes";

export interface Exercice126 {
  variante: Variante126;
  /** Centre et rayon (r entier, ou r² pour tangentePoint). */
  O: P;
  r2: number;
  /** position : droite et verdict. */
  droite?: D;
  position?: Position126;
  /** tangentePoint : point de contact. */
  T?: P;
  /** tangentesExterieur : point extérieur et longueur PT (entière). */
  P?: P;
  pt?: number;
  verticale?: boolean;
}

export const r126 = (e: Exercice126) => Math.sqrt(e.r2);

export function phases126(e: Exercice126): Phase126[] {
  if (e.variante === "position") return ["centreRayon", "distance", "position"];
  if (e.variante === "tangentePoint") return ["centre", "tangente"];
  return ["longueur", "tangentes"];
}

const NORMALES: { n: P; N: number }[] = [
  { n: { x: 3, y: 4 }, N: 5 },
  { n: { x: 4, y: 3 }, N: 5 },
  { n: { x: 3, y: -4 }, N: 5 },
  { n: { x: 4, y: -3 }, N: 5 },
  { n: { x: 5, y: 12 }, N: 13 },
  { n: { x: 12, y: -5 }, N: 13 },
  { n: { x: 1, y: 0 }, N: 1 },
  { n: { x: 0, y: 1 }, N: 1 },
];

function tirerPosition(position: Position126): Exercice126 {
  for (;;) {
    const O = { x: entier(-4, 4), y: entier(-4, 4) };
    const r = entier(2, 5);
    const { n, N } = Math.random() < 0.8 ? choisir(NORMALES.slice(0, 6)) : choisir(NORMALES.slice(6));
    const rN = r * N;
    // s = |a·p + b·q + c| = N·d.
    const s = position === "tangente" ? rN : position === "secante" ? entier(Math.max(1, rN - 3 * N), rN - 1) : entier(rN + 1, rN + 2 * N);
    const signe = Math.random() < 0.5 ? 1 : -1;
    const c = signe * s - (n.x * O.x + n.y * O.y);
    if (Math.abs(c) > 60) continue;
    // Constante du cercle développé non nulle ni trop grande.
    const F = O.x * O.x + O.y * O.y - r * r;
    if (O.x === 0 && O.y === 0) continue;
    if (Math.abs(F) > 40) continue;
    return { variante: "position", O, r2: r * r, droite: { a: n.x, b: n.y, c }, position };
  }
}

function tirerTangentePoint(verticale: boolean): Exercice126 {
  for (;;) {
    const O = { x: entier(-4, 4), y: entier(-4, 4) };
    if (O.x === 0 && O.y === 0) continue;
    let u: P;
    let r2: number;
    if (verticale) {
      const r = entier(2, 5);
      r2 = r * r;
      u = { x: Math.random() < 0.5 ? r : -r, y: 0 };
    } else {
      r2 = choisir([5, 10, 13, 17, 25, 20]);
      const cands: P[] = [];
      for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) if (x * x + y * y === r2 && x !== 0) cands.push({ x, y });
      if (cands.length === 0) continue;
      u = choisir(cands);
    }
    const F = O.x * O.x + O.y * O.y - r2;
    if (Math.abs(F) > 40) continue;
    return { variante: "tangentePoint", O, r2, T: { x: O.x + u.x, y: O.y + u.y }, verticale };
  }
}

/** (u, v) = P − Ω tels que u² + v² − r² soit un carré non nul ; `verticale` : |u| = r. */
function tirerExterieur(verticale: boolean): Exercice126 {
  for (;;) {
    const O = { x: entier(-3, 3), y: entier(-3, 3) };
    const r = entier(2, 4);
    const u = verticale ? (Math.random() < 0.5 ? r : -r) : entier(-7, 7);
    const v = entier(-7, 7);
    if (!verticale && Math.abs(u) === r) continue;
    const t2 = u * u + v * v - r * r;
    if (t2 <= 0) continue;
    const t = Math.round(Math.sqrt(t2));
    if (t * t !== t2) continue;
    if (u * u + v * v > 65) continue;
    if (verticale && v === 0) continue;
    const e: Exercice126 = { variante: "tangentesExterieur", O, r2: r * r, P: { x: O.x + u, y: O.y + v }, pt: t, verticale };
    // Coefficients des tangentes raisonnables (dénominateurs des pentes ≤ 12).
    const ds = tangentesExterieur(e);
    if (ds.some((d) => Math.abs(d.a) > 24 || Math.abs(d.b) > 24)) continue;
    return e;
  }
}

export function tirer126(variante: Variante126): Exercice126 {
  if (variante === "position") return tirerPosition(choisir(["secante", "tangente", "exterieure"] as const));
  if (variante === "tangentePoint") return tirerTangentePoint(Math.random() < 0.25);
  return tirerExterieur(Math.random() < 1 / 3);
}

// ---------------------------------------------------------------------------------------------
// Réponses exactes
// ---------------------------------------------------------------------------------------------

/** Constantes de la forme développée x² + y² + Dx + Ey + F = 0. */
export const developpee = (e: Exercice126) => ({ D: -2 * e.O.x, E: -2 * e.O.y, F: e.O.x ** 2 + e.O.y ** 2 - e.r2 });

/** Numérateur |a·p + b·q + c| et norme du vecteur normal. */
export function distance126(e: Exercice126): { num: number; norme: number; d: number } {
  const d = e.droite!;
  const num = Math.abs(d.a * e.O.x + d.b * e.O.y + d.c);
  const norme = Math.round(Math.hypot(d.a, d.b));
  return { num, norme, d: num / norme };
}

/** Tangente en T : vecteur normal ΩT. */
export function tangenteEnT(e: Exercice126): D {
  const T = e.T!;
  const n = { x: T.x - e.O.x, y: T.y - e.O.y };
  return droiteEntiere({ a: n.x, b: n.y, c: -(n.x * T.x + n.y * T.y) });
}

/** Les deux tangentes issues de P (verticale comprise). */
export function tangentesExterieur(e: Exercice126): D[] {
  const P = e.P!;
  const u = P.x - e.O.x;
  const v = P.y - e.O.y;
  const r = Math.sqrt(e.r2);
  const t = e.pt!;
  const parPente = (m: number): D => droiteEntiere({ a: m, b: -1, c: P.y - m * P.x });
  if (Math.abs(u * u - e.r2) < 1e-9) {
    const m = (v * v - e.r2) / (2 * u * v);
    return [droiteEntiere({ a: 1, b: 0, c: -P.x }), parPente(m)];
  }
  const den = u * u - e.r2;
  return [parPente((u * v + r * t) / den), parPente((u * v - r * t) / den)];
}

/** Coefficients de l'équation en m : (u² − r²)m² − 2uv·m + (v² − r²) = 0. */
export function equationPente(e: Exercice126): { A: number; B: number; C: number; u: number; v: number } {
  const u = e.P!.x - e.O.x;
  const v = e.P!.y - e.O.y;
  return { A: u * u - e.r2, B: -2 * u * v, C: v * v - e.r2, u, v };
}

/** Point de contact d'une tangente (projection du centre). */
export function pointContact(e: Exercice126, d: D): P {
  return intersectionD(d, { a: -d.b, b: d.a, c: d.b * e.O.x - d.a * e.O.y });
}

/** Points d'intersection de la droite et du cercle (0, 1 ou 2), pour la figure du corrigé. */
export function intersectionsDroiteCercle(e: Exercice126): P[] {
  const d = e.droite!;
  const H = pointContact(e, d);
  const { d: dist } = distance126(e);
  const r = Math.sqrt(e.r2);
  if (dist > r + 1e-9) return [];
  if (Math.abs(dist - r) < 1e-9) return [H];
  const h = Math.sqrt(r * r - dist * dist);
  const n = Math.hypot(d.a, d.b);
  const w = { x: -d.b / n, y: d.a / n };
  return [
    { x: H.x + h * w.x, y: H.y + h * w.y },
    { x: H.x - h * w.x, y: H.y - h * w.y },
  ];
}
