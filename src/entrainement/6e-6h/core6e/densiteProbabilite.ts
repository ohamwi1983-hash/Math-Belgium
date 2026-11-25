import type { Q } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { div, fois, moins, plus, q } from "../ui6e/outilsVariablesAleatoiresLotH1";
import type { SegmentDensite } from "../ui6e/figuresVariablesAleatoiresLotH1";

/**
 * Couche A — modèle de `6gen113` « Densité de probabilité » (6e ch. 8, § 3). Valeurs EXACTES
 * (rationnels).
 * - `trace` : densité affine par morceaux TRACÉE sur un quadrillage (abscisses entières, hauteurs k ou
 *   2k : chaque sommet est sur une intersection) — triangle, trapèze, marche, plateau puis descente,
 *   montée ; k tel que l'aire totale vaille 1, puis deux probabilités comme aires (intervalle,
 *   « au moins c » ou « au plus c »).
 * - `formule` : f(x) = k·g(x) sur [0 ; L] (g = x, x², L − x, x(L − x)) ; k par ∫ f = 1, P(a ≤ X ≤ b)
 *   par une primitive, E(X) = ∫ x f(x) dx.
 */

export type Variante113 = "trace" | "formule";
export type Phase113 = "k" | "intervalle" | "queue" | "esperance";
export type Forme113 = "triangle" | "trapeze" | "marche" | "plateau" | "montee";
export type G113 = "x" | "x2" | "Lmx" | "xLmx";

export interface Exercice113 {
  variante: Variante113;
  // trace
  forme?: Forme113;
  segments?: SegmentDensite[];
  queue?: { c: number; type: ">=" | "<=" };
  // formule
  g?: G113;
  L?: number;
  // commun
  a: number;
  b: number;
}

export function phases113(e: Exercice113): Phase113[] {
  return e.variante === "trace" ? ["k", "intervalle", "queue"] : ["k", "intervalle", "esperance"];
}

// ---------------------------------------------------------------------------
// Aires (tracé) — en unités de k
// ---------------------------------------------------------------------------

/** Hauteur (en unités de k) du segment en x (rationnel). */
function hauteurSur(s: SegmentDensite, x: Q): Q {
  const pente = q(s.y1 - s.y0, s.x1 - s.x0);
  return plus(q(s.y0), fois(pente, moins(x, q(s.x0))));
}

/** Morceaux d'aire entre u et v (unités de k) : un par segment touché, avec leurs bornes et hauteurs. */
export function morceaux(segments: SegmentDensite[], u: number, v: number): { x0: number; x1: number; h0: Q; h1: Q; aire: Q }[] {
  const out: { x0: number; x1: number; h0: Q; h1: Q; aire: Q }[] = [];
  for (const s of segments) {
    const x0 = Math.max(u, s.x0);
    const x1 = Math.min(v, s.x1);
    if (x1 <= x0) continue;
    const h0 = hauteurSur(s, q(x0));
    const h1 = hauteurSur(s, q(x1));
    out.push({ x0, x1, h0, h1, aire: fois(q(x1 - x0, 2), plus(h0, h1)) });
  }
  return out;
}

export const aireUnites = (segments: SegmentDensite[], u: number, v: number): Q => morceaux(segments, u, v).reduce((acc, m) => plus(acc, m.aire), q(0));

export const support = (e: Exercice113): [number, number] => (e.variante === "trace" ? [e.segments![0]!.x0, e.segments![e.segments!.length - 1]!.x1] : [0, e.L!]);

// ---------------------------------------------------------------------------
// Formule — primitives
// ---------------------------------------------------------------------------

/** ∫₀ᴸ g, primitive G en un point, ∫₀ᴸ x·g. */
export function primitiveG(g: G113, L: number, x: number): Q {
  switch (g) {
    case "x":
      return q(x * x, 2);
    case "x2":
      return q(x ** 3, 3);
    case "Lmx":
      return moins(q(L * x), q(x * x, 2));
    case "xLmx":
      return moins(q(L * x * x, 2), q(x ** 3, 3));
  }
}

export function integraleXG(g: G113, L: number): Q {
  switch (g) {
    case "x":
      return q(L ** 3, 3);
    case "x2":
      return q(L ** 4, 4);
    case "Lmx":
      return q(L ** 3, 6);
    case "xLmx":
      return q(L ** 4, 12);
  }
}

// ---------------------------------------------------------------------------
// Valeurs attendues
// ---------------------------------------------------------------------------

export function aireTotale(e: Exercice113): Q {
  return e.variante === "trace" ? aireUnites(e.segments!, ...support(e)) : primitiveG(e.g!, e.L!, e.L!);
}

export const valeurK = (e: Exercice113): Q => div(q(1), aireTotale(e));

export function probaIntervalle113(e: Exercice113): Q {
  if (e.variante === "trace") return fois(valeurK(e), aireUnites(e.segments!, e.a, e.b));
  return fois(valeurK(e), moins(primitiveG(e.g!, e.L!, e.b), primitiveG(e.g!, e.L!, e.a)));
}

/** Bornes de l'aire de la queue (tracé). */
export function bornesQueue(e: Exercice113): [number, number] {
  const [u, v] = support(e);
  return e.queue!.type === ">=" ? [e.queue!.c, v] : [u, e.queue!.c];
}

export const probaQueue113 = (e: Exercice113): Q => fois(valeurK(e), aireUnites(e.segments!, ...bornesQueue(e)));

export const esperance113 = (e: Exercice113): Q => fois(valeurK(e), integraleXG(e.g!, e.L!));

// ---------------------------------------------------------------------------
// Tirage
// ---------------------------------------------------------------------------

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function segmentsDe(forme: Forme113): SegmentDensite[] {
  for (;;) {
    const u = entier(0, 2);
    switch (forme) {
      case "triangle": {
        const v = u + parmi([4, 5, 6]);
        const m = entier(u + 1, v - 1);
        return [
          { x0: u, x1: m, y0: 0, y1: 1 },
          { x0: m, x1: v, y0: 1, y1: 0 },
        ];
      }
      case "trapeze": {
        const p = u + entier(1, 2);
        const r = p + entier(1, 3);
        const v = r + entier(1, 2);
        if (v > 8) continue;
        return [
          { x0: u, x1: p, y0: 0, y1: 1 },
          { x0: p, x1: r, y0: 1, y1: 1 },
          { x0: r, x1: v, y0: 1, y1: 0 },
        ];
      }
      case "marche": {
        const p = u + entier(1, 3);
        const v = p + entier(1, 3);
        return [
          { x0: u, x1: p, y0: 1, y1: 1 },
          { x0: p, x1: v, y0: 2, y1: 2 },
        ];
      }
      case "plateau": {
        const p = u + entier(1, 3);
        const v = p + entier(2, 4);
        if (v > 8) continue;
        return [
          { x0: u, x1: p, y0: 1, y1: 1 },
          { x0: p, x1: v, y0: 1, y1: 0 },
        ];
      }
      case "montee": {
        const v = u + parmi([2, 4]);
        return [{ x0: u, x1: v, y0: 0, y1: 2 }];
      }
    }
  }
}

export function tirer113(variante: Variante113): Exercice113 {
  if (variante === "trace") {
    const forme = parmi<Forme113>(["triangle", "trapeze", "marche", "plateau", "montee"]);
    const segments = segmentsDe(forme);
    const u = segments[0]!.x0;
    const v = segments[segments.length - 1]!.x1;
    // Bornes où la hauteur tombe sur une ligne du quadrillage (multiple de k/2) : rien à deviner
    // entre deux lignes (sommets ET bornes lus sur la grille).
    const surGrille = (x: number) => segments.every((s) => x < s.x0 || x > s.x1 || hauteurSur(s, q(x)).d <= 2);
    const points = Array.from({ length: v - u + 1 }, (_, i) => u + i).filter(surGrille);
    let a: number;
    let b: number;
    do {
      a = parmi(points.filter((x) => x < v));
      b = parmi(points.filter((x) => x > a));
    } while (a === u && b === v);
    const internes = points.filter((x) => x > u && x < v);
    const c = internes.length ? parmi(internes) : entier(u + 1, v - 1);
    return { variante, forme, segments, a, b, queue: { c, type: parmi<">=" | "<=">([">=", "<="]) } };
  }
  const g = parmi<G113>(["x", "x2", "Lmx", "xLmx"]);
  const L = parmi([2, 3, 4, 6]);
  let a: number;
  let b: number;
  do {
    a = entier(0, L - 1);
    b = entier(a + 1, L);
  } while (a === 0 && b === L);
  return { variante, g, L, a, b };
}
