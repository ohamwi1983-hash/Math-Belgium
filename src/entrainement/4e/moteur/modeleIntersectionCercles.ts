import type { Cercle, ExerciceIntersectionCercles } from "../core/intersectionCercles.types";
import { normaliser, pgcd, type D, type P } from "../ui/outilsAnalytiqueLotG";

/**
 * Modèle de gen98 : toutes les grandeurs exactes (une seule source pour le générateur, l'écran, le
 * papier et le corrigé).
 */

type E = ExerciceIntersectionCercles;

/** x² + y² + Dx + Ey + F = 0. */
export function developpe(c: Cercle): { D: number; E: number; F: number } {
  return { D: -2 * c.centre.x, E: -2 * c.centre.y, F: c.centre.x ** 2 + c.centre.y ** 2 - c.R };
}

/** Différence c₁ − c₂ (non simplifiée) et sa forme normalisée. */
export function difference(c1: Cercle, c2: Cercle): { brute: D; normale: D } {
  const a = developpe(c1);
  const b = developpe(c2);
  const brute = { a: a.D - b.D, b: a.E - b.E, c: a.F - b.F };
  return { brute, normale: normaliser(brute) };
}

export interface Substitution {
  /** Inconnue gardée après substitution. */
  u: "x" | "y";
  /** Autre coordonnée : v = m·u + p. */
  v: "x" | "y";
  m: number;
  p: number;
  /** Équation A u² + B u + C = 0 avant et après division par g. */
  brut: [number, number, number];
  g: number;
  reduit: [number, number, number];
  delta: number;
  racines: number[];
}

function racinesExactes(A: number, B: number, C: number): { delta: number; racines: number[] } {
  const delta = B * B - 4 * A * C;
  if (delta < 0) return { delta, racines: [] };
  if (delta === 0) return { delta, racines: [-B / (2 * A)] };
  const r = Math.sqrt(delta);
  const x1 = (-B - r) / (2 * A);
  const x2 = (-B + r) / (2 * A);
  return { delta, racines: x1 < x2 ? [x1, x2] : [x2, x1] };
}

/** Cercle-cercle : on isole la coordonnée de coefficient ±1 dans la droite, puis on remplace dans c₁. */
export function substitutionCercles(c1: Cercle, rad: D): Substitution | null {
  const { D: D1, E: E1, F: F1 } = developpe(c1);
  let u: "x" | "y", v: "x" | "y", m: number, p: number, brut: [number, number, number];
  if (Math.abs(rad.b) === 1) {
    u = "x";
    v = "y";
    m = -rad.a / rad.b;
    p = -rad.c / rad.b;
    brut = [1 + m * m, 2 * m * p + D1 + E1 * m, p * p + E1 * p + F1];
  } else if (Math.abs(rad.a) === 1) {
    u = "y";
    v = "x";
    m = -rad.b / rad.a;
    p = -rad.c / rad.a;
    brut = [1 + m * m, 2 * m * p + E1 + D1 * m, p * p + D1 * p + F1];
  } else return null;
  const g = pgcd(pgcd(brut[0], brut[1]), brut[2]) || 1;
  const reduit = brut.map((c) => c / g + 0) as [number, number, number];
  const { delta, racines } = racinesExactes(...reduit);
  return { u, v, m: m + 0, p: p + 0, brut, g, reduit, delta, racines };
}

export interface SubstitutionParabole {
  /** Coordonnée de l'axe (y pour un axe vertical) et l'autre. */
  u: "x" | "y";
  v: "x" | "y";
  uS: number;
  vS: number;
  /** Ordonnée (ou abscisse) du centre du cercle sur l'axe. */
  b: number;
  k: number;
  R: number;
  /** u² + B u + C = 0. */
  B: number;
  C: number;
  delta: number;
  racines: number[];
  /** Pour chaque racine : k(u − u_S) = (v − v_S)². */
  carres: number[];
}

export function substitutionParabole(e: E): SubstitutionParabole {
  const vertical = e.axe === "vertical";
  const S = e.S!;
  const uS = vertical ? S.y : S.x;
  const vS = vertical ? S.x : S.y;
  const b = vertical ? e.c1.centre.y : e.c1.centre.x;
  const k = e.k!;
  const R = e.c1.R;
  const B = k - 2 * b;
  const C = b * b - k * uS - R;
  const { delta, racines } = racinesExactes(1, B, C);
  return { u: vertical ? "y" : "x", v: vertical ? "x" : "y", uS, vS, b, k, R, B, C, delta, racines, carres: racines.map((r) => k * (r - uS)) };
}

/** Points communs (cercle-parabole) à partir des racines retenues. */
export function pointsParabole(s: SubstitutionParabole): P[] {
  const out: P[] = [];
  s.racines.forEach((r, i) => {
    const c = s.carres[i]!;
    if (c < -1e-9) return;
    const vs = c < 1e-9 ? [s.vS] : [s.vS - Math.sqrt(c), s.vS + Math.sqrt(c)];
    for (const v of vs) out.push(s.u === "y" ? { x: v, y: r } : { x: r, y: v });
  });
  return out;
}

export function pointsCercles(s: Substitution): P[] {
  return s.racines.map((r) => {
    const autre = s.m * r + s.p;
    return s.u === "x" ? { x: r, y: autre } : { x: autre, y: r };
  });
}

/** La racine est-elle un entier ou un rationnel simple (corrigé lisible) ? */
export const propre = (v: number) => Math.abs(v * 12 - Math.round(v * 12)) < 1e-9;
