import type { CandidatReciproque, ExerciceGrapheReciproque } from "../core6e/grapheReciproque.types";
import { q, qL } from "../ui6e/nombresRecip";

/**
 * Modèle de `6gen154` « Graphe de la réciproque » : courbe de f (spline cubique d'Hermite monotone
 * par ses trois nœuds entiers, pente p/q en A), courbe de f⁻¹ et des distracteurs, domaines et
 * images, pentes. Une seule source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceGrapheReciproque;

/** Demi-largeur de la fenêtre (carrée, même échelle) : [−6 ; 6]². */
export const FENETRE = 6;

/** Point A (nœud du milieu). */
export const pointA = (e: E): [number, number] => e.noeuds[1];

/** f(x) par interpolation cubique d'Hermite sur les deux arcs. */
export function fDe(e: E): (x: number) => number {
  const [P0, A, P2] = e.noeuds;
  const m = [e.pentesBords[0], e.p / e.q, e.pentesBords[1]];
  const N = [P0, A, P2];
  return (x: number) => {
    const i = x <= A[0] ? 0 : 1;
    const [x0, y0] = N[i];
    const [x1, y1] = N[i + 1];
    const h = x1 - x0;
    const t = (x - x0) / h;
    const h00 = 2 * t ** 3 - 3 * t * t + 1;
    const h10 = t ** 3 - 2 * t * t + t;
    const h01 = -2 * t ** 3 + 3 * t * t;
    const h11 = t ** 3 - t * t;
    return h00 * y0 + h10 * h * m[i] + h01 * y1 + h11 * h * m[i + 1];
  };
}

/** Points de la courbe de f (abscisses croissantes). */
export function pointsCourbe(e: E, n = 90): [number, number][] {
  const f = fDe(e);
  const a = e.noeuds[0][0];
  const b = e.noeuds[2][0];
  const out: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const x = a + ((b - a) * k) / n;
    out.push([x, f(x)]);
  }
  return out;
}

/** Image d'un point par la transformation d'un candidat. */
export function transformer(c: CandidatReciproque | "f", [x, y]: [number, number]): [number, number] {
  switch (c) {
    case "f":
      return [x, y];
    case "reciproque":
      return [y, x];
    case "antidiagonale":
      return [-y, -x];
    case "axeX":
      return [x, -y];
    case "axeY":
      return [-x, y];
  }
}

export function pointsCandidat(e: E, c: CandidatReciproque | "f"): [number, number][] {
  return pointsCourbe(e).map((p) => transformer(c, p));
}

/** Lettre (A–D) du bon graphe. */
export const LETTRES_GRAPHES = ["A", "B", "C", "D"];
export const lettreReciproque = (e: E): string => LETTRES_GRAPHES[e.candidats.indexOf("reciproque")];

// ============================================================================
// Domaines, images.
// ============================================================================

export interface Intervalle {
  g: number;
  d: number;
  gFerme: boolean;
  dFerme: boolean;
}

export function intervalleL(iv: Intervalle): string {
  return `${iv.gFerme ? "\\left[" : "\\left]"}${iv.g}\\,;\\,${iv.d}${iv.dFerme ? "\\right]" : "\\right["}`;
}

export function domaineF(e: E): Intervalle {
  return { g: e.noeuds[0][0], d: e.noeuds[2][0], gFerme: !e.ouvert[0], dFerme: !e.ouvert[1] };
}

export function imageF(e: E): Intervalle {
  const [P0, , P2] = e.noeuds;
  return e.variante === "croissante"
    ? { g: P0[1], d: P2[1], gFerme: !e.ouvert[0], dFerme: !e.ouvert[1] }
    : { g: P2[1], d: P0[1], gFerme: !e.ouvert[1], dFerme: !e.ouvert[0] };
}

export const domaineReciproque = imageF;
export const imageReciproque = domaineF;

// ============================================================================
// Pentes.
// ============================================================================

export const penteF = (e: E) => q(e.p, e.q);
export const penteReciproque = (e: E) => q(e.q, e.p);
export const penteFL = (e: E): string => qL(penteF(e));
export const penteRecL = (e: E): string => qL(penteReciproque(e));

/** Second nœud de la tangente : A + (q ; p) (ou A − (q ; p) s'il sort de la fenêtre). */
export function noeudTangente(e: E): [number, number] {
  const [x, y] = pointA(e);
  const plus: [number, number] = [x + e.q, y + e.p];
  const dans = (p: [number, number]) => Math.abs(p[0]) <= FENETRE - 1 && Math.abs(p[1]) <= FENETRE - 1;
  return dans(plus) ? plus : [x - e.q, y - e.p];
}
