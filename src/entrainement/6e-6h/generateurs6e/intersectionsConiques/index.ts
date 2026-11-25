import type { ExerciceIntersectionA, ExerciceIntersectionB, ExerciceIntersectionsConiques, SousTypeDroite } from "../../core6e/intersectionsConiques.types";
import type { Axe, Conique } from "../../moteur6e/algebreConiques";
import { c2Conique, ppcmDen, polyConique, tailleQ } from "../../moteur6e/algebreConiques";
import { droiteParDeuxPoints, pgcd, polyCoef, polyConstante, pt, ptEq, q, qAdd, qDiv, qMul, qNeg, qNum, qSub, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Pt, Q } from "../../moteur6e/algebreLieux";

/**
 * `6gen61` — Intersection d'une conique et d'une droite (6e ch. 10 ; audit, lots B et C). Construit À
 * REBOURS : nombre de points communs (0, 1, 2) tiré D'ABORD, à parts égales, pour l'ellipse, le cercle
 * ET l'hyperbole ; points d'intersection rationnels (paramétrage rationnel de la conique), droite par
 * eux, tangente en l'un d'eux, ou droite qui manque la conique (pente et ordonnée contrôlées). La
 * droite est donnée par deux AUTRES points, une médiatrice ou une hauteur (plus jamais les points
 * d'intersection eux-mêmes, G18). Coefficients et discriminant bornés (G18 : jusqu'à 2 073 600 avant).
 */

const T_ELLIPSE: Q[] = [q(0), q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2), q(-2), q(3), q(-3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2), q(1), q(-1)];
const T_HYPERBOLE: Q[] = [q(0), q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2), q(-2), q(3), q(-3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2)];

function local(c: Conique, t: Q): Pt {
  const un = q(1);
  const t2 = qMul(t, t);
  if (c.type === "cercle") {
    const r = q(Math.round(Math.sqrt(qNum(c.r2))));
    return { x: qDiv(qMul(r, qSub(un, t2)), qAdd(un, t2)), y: qDiv(qMul(qMul(q(2), r), t), qAdd(un, t2)) };
  }
  if (c.type !== "ellipse" && c.type !== "hyperbole") throw new Error("conique");
  const a = q(Math.round(Math.sqrt(qNum(c.a2))));
  const b = q(Math.round(Math.sqrt(qNum(c.b2))));
  const [u, v] = c.type === "ellipse" ? [qDiv(qMul(a, qSub(un, t2)), qAdd(un, t2)), qDiv(qMul(qMul(q(2), b), t), qAdd(un, t2))] : [qDiv(qMul(a, qAdd(un, t2)), qSub(un, t2)), qDiv(qMul(qMul(q(2), b), t), qSub(un, t2))];
  const s = Math.random() < 0.5 ? q(1) : q(-1);
  const uu = c.type === "hyperbole" ? qMul(s, u) : u;
  return c.axe === "x" ? { x: uu, y: v } : { x: v, y: uu };
}

/** P(x ; m x + k) = A x² + B x + C (exact). */
export function quadratique(c: Conique, m: Q, k: Q): [Q, Q, Q] {
  const P = polyConique(c);
  const al = polyCoef(P, { x: 2 });
  const be = polyCoef(P, { y: 2 });
  const de = polyCoef(P, { x: 1 });
  const ep = polyCoef(P, { y: 1 });
  const ze = polyConstante(P);
  const A = qAdd(al, qMul(be, qMul(m, m)));
  const B = qAdd(qAdd(qMul(q(2), qMul(be, qMul(m, k))), de), qMul(ep, m));
  const C = qAdd(qAdd(qMul(be, qMul(k, k)), qMul(ep, k)), ze);
  return [A, B, C];
}

/** Coefficients entiers premiers entre eux, premier coefficient positif. */
export function entiers(t: [Q, Q, Q]): [bigint, bigint, bigint] {
  const L = ppcmDen(t);
  const e = t.map((r) => (r.n * L) / r.d);
  const g = BigInt(pgcd(pgcd(Number(e[0]), Number(e[1])), Number(e[2])) || 1);
  const s = e[0] < 0n ? -1n : 1n;
  return [(s * e[0]) / g, (s * e[1]) / g, (s * e[2]) / g];
}

const signeDelta = (e: [bigint, bigint, bigint]) => {
  const d = e[1] * e[1] - 4n * e[0] * e[2];
  return d > 0n ? 2 : d === 0n ? 1 : 0;
};

function coniqueAuHasard(nature: "ellipse" | "hyperbole" | "cercle"): { conique: Conique; S: Pt; F: Pt | null } {
  const axe: Axe = tirerParmi(["x", "y"] as const);
  const surAxe = (v: number) => (axe === "x" ? pt(v, 0) : pt(0, v));
  const sg = () => (Math.random() < 0.5 ? 1 : -1);
  if (nature === "cercle") {
    const r = tirerParmi([2, 3, 4, 5, 5, 10]);
    const S = r % 5 === 0 && Math.random() < 0.6 ? pt(sg() * (3 * r) / 5, sg() * (4 * r) / 5) : surAxe(sg() * r);
    return { conique: { type: "cercle", centre: pt(0, 0), r2: q(r * r) }, S, F: null };
  }
  for (;;) {
    const a = tirerEntier(nature === "ellipse" ? 2 : 1, nature === "ellipse" ? 8 : 6);
    const b = nature === "ellipse" ? tirerEntier(1, a - 1) : tirerEntier(1, 6);
    const c: Conique = { type: nature, centre: pt(0, 0), axe, a2: q(a * a), b2: q(b * b) };
    const c2 = c2Conique(c as Extract<Conique, { type: "ellipse" | "hyperbole" }>);
    const rc = Math.round(Math.sqrt(qNum(c2)));
    if (rc * rc !== qNum(c2)) continue; // foyer à coordonnées entières (données lisibles)
    return { conique: c, S: surAxe(sg() * a), F: surAxe(sg() * rc) };
  }
}

const petit = (r: Q, max = 12) => tailleQ(r) <= max * Math.max(1, Math.abs(qNum(r))) && Number(r.d) <= max;

function droiteManquante(c: Conique): { m: Q; k: Q } | null {
  for (let i = 0; i < 60; i++) {
    const m = tirerParmi([q(0), q(1), q(-1), q(2), q(-2), q(1, 2), q(-1, 2), q(3), q(-3), q(1, 3), q(-1, 3), q(3, 2), q(-3, 2), q(4), q(-4)]);
    const k = q(tirerEntier(-12, 12), tirerParmi([1, 1, 2]));
    const eq = entiers(quadratique(c, m, k));
    if (eq[0] === 0n) continue;
    if (signeDelta(eq) === 0) return { m, k };
  }
  return null;
}

function pointSurDroite(m: Q, k: Q, eviter: Pt[]): Pt | null {
  for (let i = 0; i < 40; i++) {
    const x = q(tirerEntier(-6, 6) * Number(m.d));
    if (Math.abs(qNum(x)) > 8) continue;
    const P = { x, y: qAdd(qMul(m, x), k) };
    if (Number(P.y.d) > 6 || Math.abs(qNum(P.y)) > 12) continue;
    if (eviter.some((E) => ptEq(E, P))) continue;
    return P;
  }
  return null;
}

export function construireA(nature: "ellipse" | "hyperbole" | "cercle" = tirerParmi(["ellipse", "hyperbole", "cercle"] as const), verdict: 0 | 1 | 2 = tirerParmi([0, 1, 2] as const), sousType: SousTypeDroite = tirerParmi(["deuxPoints", "mediatrice", "hauteur"] as const)): ExerciceIntersectionA {
  for (;;) {
    const { conique, S, F } = coniqueAuHasard(nature);
    const T = nature === "hyperbole" ? T_HYPERBOLE : T_ELLIPSE;
    let m: Q;
    let k: Q;
    let points: Pt[] = [];
    if (verdict === 0) {
      const d = droiteManquante(conique);
      if (!d) continue;
      ({ m, k } = d);
    } else if (verdict === 1) {
      const P = local(conique, tirerParmi(T));
      // Tangente (forme dédoublée) : pente −(∂P/∂x)/(∂P/∂y) au point P.
      const Pp = polyConique(conique);
      const gx = qAdd(qMul(qMul(q(2), polyCoef(Pp, { x: 2 })), P.x), polyCoef(Pp, { x: 1 }));
      const gy = qAdd(qMul(qMul(q(2), polyCoef(Pp, { y: 2 })), P.y), polyCoef(Pp, { y: 1 }));
      if (gy.n === 0n) continue;
      m = qNeg(qDiv(gx, gy));
      k = qSub(P.y, qMul(m, P.x));
      points = [P];
    } else {
      const P1 = local(conique, tirerParmi(T));
      const P2 = local(conique, tirerParmi(T));
      if (qEqP(P1, P2) || P1.x.n * P2.x.d === P2.x.n * P1.x.d) continue;
      m = qDiv(qSub(P2.y, P1.y), qSub(P2.x, P1.x));
      k = qSub(P1.y, qMul(m, P1.x));
      points = [P1, P2];
    }
    if (!petit(m, 8) || Number(k.d) > 12 || Math.abs(qNum(k)) > 15) continue;
    if (points.some((P) => Number(P.x.d) > 30 || Number(P.y.d) > 30)) continue;
    const eq = entiers(quadratique(conique, m, k));
    if (eq[0] === 0n || signeDelta(eq) !== verdict) continue;
    if (eq.some((x) => (x < 0n ? -x : x) > 400n)) continue;
    // Points qui définissent la droite.
    const u = { x: q(Number(m.d)), y: q(Number(m.n)) };
    const w = { x: q(-Number(m.n)), y: q(Number(m.d)) };
    if (Math.hypot(qNum(u.x), qNum(u.y)) > 6) continue;
    const plus = (P: Pt, v: { x: Q; y: Q }, s: number) => ({ x: qAdd(P.x, qMul(q(s), v.x)), y: qAdd(P.y, qMul(q(s), v.y)) });
    let A: Pt | null;
    let B: Pt | null;
    let C: Pt | null = null;
    if (sousType === "deuxPoints") {
      A = pointSurDroite(m, k, points);
      B = A && pointSurDroite(m, k, [...points, A]);
    } else {
      const M = pointSurDroite(m, k, []);
      if (!M) continue;
      if (sousType === "mediatrice") {
        A = plus(M, w, 1);
        B = plus(M, w, -1);
      } else {
        A = plus(M, w, tirerParmi([1, 2]));
        B = plus(M, w, -tirerParmi([1, 2]));
        C = plus(M, u, tirerParmi([-2, -1, 1, 2]));
      }
    }
    if (!A || !B) continue;
    // Aucun point commun ne doit figurer dans les données (sommet, foyer, points de la droite).
    if (points.some((P) => [S, F, A, B, C].some((D) => D && ptEq(D, P)))) continue;
    if ([A, B, C].some((P) => P && (Math.abs(qNum(P.x)) > 14 || Math.abs(qNum(P.y)) > 14))) continue;
    const droite = droiteParDeuxPoints({ x: q(0), y: k }, { x: q(1), y: qAdd(m, k) });
    return { famille: "A", nature, verdict, sousTypeDroite: sousType, conique, S, F, A, B, C, droite, m, k, eq, points };
  }
}

const qEqP = (a: Pt, b: Pt) => ptEq(a, b);

/** Nombre de racines réelles de P(x) sur [−60 ; 60] (changements de signe d'un échantillonnage fin). */
function racinesReelles(f: (x: number) => number): number {
  let n = 0;
  let prec = f(-60);
  for (let i = 1; i <= 24000; i++) {
    const v = f(-60 + i * 0.005);
    if (prec === 0 || Math.sign(v) !== Math.sign(prec)) n++;
    prec = v;
  }
  return n;
}

export function construireB(): ExerciceIntersectionB {
  for (;;) {
    const [a2, b2] = tirerParmi([
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [2, 5],
    ] as [number, number][]);
    const [A2, B2] = Math.random() < 0.5 ? [a2, b2] : [b2, a2];
    const b1 = tirerEntier(-4, 4);
    const c1 = tirerEntier(-4, 4);
    const h = tirerEntier(-4, 4);
    const kk = tirerEntier(-3, 5);
    const r = tirerEntier(2, 5);
    const lambda = B2 - A2;
    const K = B2;
    const D2 = -2 * K * h - lambda * b1;
    const E2 = -2 * K * kk + lambda;
    const F2 = K * (h * h + kk * kk - r * r) - lambda * c1;
    if (Math.max(Math.abs(D2), Math.abs(E2), Math.abs(F2)) > 90) continue;
    // Points communs de la parabole et du cercle (donc de C₁ et C₂) : au moins deux.
    const n = racinesReelles((x) => {
      const y = x * x + b1 * x + c1;
      return (x - h) ** 2 + (y - kk) ** 2 - r * r;
    });
    if (n < 2) continue;
    const g = pgcd(pgcd(pgcd(A2, B2), pgcd(D2, E2)), F2);
    if (g > 1) continue;
    return { famille: "B", b1, c1, A2, B2, D2, E2, F2, lambda, mu: 1, centre: pt(h, kk), rayon: r };
  }
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A_ellipse_deuxPoints", label: "A — ellipse, droite par deux points" },
  { id: "A_ellipse_mediatrice", label: "A — ellipse, droite = médiatrice" },
  { id: "A_ellipse_hauteur", label: "A — ellipse, droite = hauteur" },
  { id: "A_hyperbole_deuxPoints", label: "A — hyperbole, droite par deux points" },
  { id: "A_hyperbole_mediatrice", label: "A — hyperbole, droite = médiatrice" },
  { id: "A_hyperbole_hauteur", label: "A — hyperbole, droite = hauteur" },
  { id: "A_cercle_deuxPoints", label: "A — cercle, droite par deux points" },
  { id: "A_cercle_mediatrice", label: "A — cercle, droite = médiatrice" },
  { id: "A_cercle_hauteur", label: "A — cercle, droite = hauteur" },
  { id: "A_ellipse_0solution", label: "A — ellipse : aucun point commun" },
  { id: "A_ellipse_1solution", label: "A — ellipse : un point commun" },
  { id: "A_ellipse_2solutions", label: "A — ellipse : deux points communs" },
  { id: "A_hyperbole_1solution", label: "A — hyperbole : un point commun" },
  { id: "A_hyperbole_2solutions", label: "A — hyperbole : deux points communs" },
  { id: "B_combinaison", label: "B — parabole et ellipse : le cercle λC₁ + μC₂" },
  { id: "A_hyperbole_0solution", label: "A — hyperbole : aucun point commun" },
];

export function construireAvecVarianteId(id: string): ExerciceIntersectionsConiques {
  if (id === "B_combinaison") return construireB();
  const [, nature, cas] = id.split("_") as [string, "ellipse" | "hyperbole" | "cercle", string];
  const n = cas.match(/^(\d)solution/);
  if (n) return construireA(nature, Number(n[1]) as 0 | 1 | 2);
  return construireA(nature, undefined, cas as SousTypeDroite);
}

export function genererExerciceIntersectionsConiques(): ExerciceIntersectionsConiques {
  return Math.random() < 0.75 ? construireA() : construireB();
}

/** Groupes à verdict (décision 3) : le nombre de points communs tiré au hasard. */
export const GROUPES_VERDICT_6GEN61 = [
  { id: "groupe_ellipse_nombre", label: "A — ellipse (nombre de points communs tiré au hasard)", variantes: ["A_ellipse_0solution", "A_ellipse_1solution", "A_ellipse_2solutions"] },
  { id: "groupe_hyperbole_nombre", label: "A — hyperbole (nombre de points communs tiré au hasard)", variantes: ["A_hyperbole_0solution", "A_hyperbole_1solution", "A_hyperbole_2solutions"] },
];

export type { ExerciceIntersectionA, ExerciceIntersectionB };
