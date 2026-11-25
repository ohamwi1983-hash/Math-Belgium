import type { D, P } from "../ui6e/outilsLieuxLotH1";
import { droiteEntiere, equationCours, nb } from "../ui6e/outilsLieuxLotH1";
import type { Poly } from "../ui6e/outilsLieuxLotH2";
import { evalPoly, pgcd } from "../ui6e/outilsLieuxLotH2";

/**
 * Modèle commun des générateurs 6gen132–6gen137 (6e ch. 10 « Les coniques », lot H1) : une conique
 * d'axes parallèles aux axes du repère, décrite par sa nature, son centre (ou son sommet pour la
 * parabole), son axe focal et ses paramètres — convention du cours et de la 4e :
 * - ellipse `(x−h)²/a² + (y−k)²/b² = 1` (axe focal horizontal ; `a² > b²`), `c² = a² − b²` ;
 * - hyperbole `(x−h)²/a² − (y−k)²/b² = 1` (axe focal horizontal), `c² = a² + b²` ;
 * - parabole `(y−k)² = ±2p(x−h)`, `p = dist(F ; d)`, foyer à `p/2` du sommet du côté de l'ouverture.
 * Axe focal vertical : les rôles de x et y sont échangés.
 *
 * Nombres EXACTS `q + r√n` (`Ex`, q et r rationnels, n sans facteur carré) : sommets, foyers,
 * directrices et excentricité s'écrivent en LaTeX sans jamais d'arrondi ; les comparaisons se font sur
 * leurs valeurs. Sans `docx` : importé par les écrans, les corrigés et les adaptateurs papier.
 */

export type Nature = "ellipse" | "hyperbole" | "parabole";
export type Axe = "x" | "y";

export interface Conique {
  nature: Nature;
  /** Centre (ellipse, hyperbole) ou sommet (parabole). */
  h: number;
  k: number;
  /** Direction de l'axe focal. */
  axe: Axe;
  /** a² et b² (ellipse, hyperbole ; a = demi-axe focal). */
  a2: number;
  b2: number;
  /** Paramètre et sens d'ouverture (parabole). */
  p: number;
  sens: 1 | -1;
}

// ---------------------------------------------------------------------------------------------
// Nombres exacts q + r√n
// ---------------------------------------------------------------------------------------------

export interface Ex {
  q: number;
  r: number;
  n: number;
}

const net = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v);

export const ex = (q: number, r = 0, n = 1): Ex => (n === 1 || r === 0 ? { q: net(q + r), r: 0, n: 1 } : { q: net(q), r: net(r), n });
export const val = (e: Ex) => e.q + e.r * Math.sqrt(e.n);
export const plus = (u: Ex, v: Ex): Ex => {
  if (u.r === 0) return ex(u.q + v.q, v.r, v.n);
  if (v.r === 0 || v.n === u.n) return ex(u.q + v.q, u.r + v.r, u.n);
  throw new Error("radicaux différents");
};
export const fois = (k: number, u: Ex): Ex => ex(k * u.q, k * u.r, u.n);
export const oppose = (u: Ex): Ex => fois(-1, u);

/** Fraction u/v réduite à partir d'un rationnel simple (dénominateur ≤ 1000). */
function fraction(x: number): [number, number] {
  for (let d = 1; d <= 1000; d++) {
    const n = x * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return [Math.round(n), d];
  }
  return [x, 1];
}

/** √m exact (m rationnel ≥ 0). */
export function racineEx(m: number): Ex {
  const [u, v] = fraction(m);
  let produit = u * v;
  let s = 1;
  for (let f = 2; f * f <= produit; f++) {
    while (produit % (f * f) === 0) {
      produit /= f * f;
      s *= f;
    }
  }
  return ex(0, s / v, produit);
}

/** « 2\sqrt{3} », « \dfrac{\sqrt{13}}{2} » pour r > 0. */
function radL(r: number, n: number): string {
  const [u, v] = fraction(r);
  const num = `${u === 1 ? "" : u}\\sqrt{${n}}`;
  return v === 1 ? num : `\\dfrac{${num}}{${v}}`;
}

/** LaTeX exact : « 3 », « -\dfrac{5}{2} », « 2+\sqrt{13} », « -1-\dfrac{4\sqrt{13}}{13} ». */
export function exL(e: Ex): string {
  const q = net(e.q);
  if (e.r === 0) return nb(q);
  const r = net(e.r);
  const rad = radL(Math.abs(r), e.n);
  if (q === 0) return r < 0 ? `-${rad}` : rad;
  return `${nb(q)}${r < 0 ? "-" : "+"}${rad}`;
}

export interface PEx {
  x: Ex;
  y: Ex;
}
export const valP = (p: PEx): P => ({ x: val(p.x), y: val(p.y) });
export function ptExL(p: PEx): string {
  const c = `${exL(p.x)}\\,;${exL(p.y)}`;
  return /dfrac/.test(c) ? `\\left(${c}\\right)` : `(${c})`;
}
export const nomPtExL = (nom: string, p: PEx) => `${nom}${ptExL(p)}`;

// ---------------------------------------------------------------------------------------------
// Éléments caractéristiques
// ---------------------------------------------------------------------------------------------

export const c2 = (C: Conique) => (C.nature === "ellipse" ? C.a2 - C.b2 : C.a2 + C.b2);
export const aEx = (C: Conique) => racineEx(C.a2);
export const bEx = (C: Conique) => racineEx(C.b2);
export const cEx = (C: Conique) => racineEx(c2(C));

/** Point (h ; k) + s le long de l'axe focal + t le long de l'autre axe. */
export function deplace(C: Conique, s: Ex, t: Ex = ex(0)): PEx {
  const h = ex(C.h);
  const k = ex(C.k);
  return C.axe === "x" ? { x: plus(h, s), y: plus(k, t) } : { x: plus(h, t), y: plus(k, s) };
}

export const centre = (C: Conique): PEx => ({ x: ex(C.h), y: ex(C.k) });

/** Sommets : ellipse [A, A′ (axe focal), B, B′] ; hyperbole [A, A′] ; parabole [S]. */
export function sommets(C: Conique): PEx[] {
  if (C.nature === "parabole") return [centre(C)];
  const a = aEx(C);
  const focaux = [deplace(C, a), deplace(C, oppose(a))];
  if (C.nature === "hyperbole") return focaux;
  const b = bEx(C);
  return [...focaux, deplace(C, ex(0), b), deplace(C, ex(0), oppose(b))];
}

/** Foyers : [F, F′] (coniques centrées) ou [F] (parabole). */
export function foyers(C: Conique): PEx[] {
  if (C.nature === "parabole") return [deplace(C, ex((C.sens * C.p) / 2))];
  const c = cEx(C);
  return [deplace(C, c), deplace(C, oppose(c))];
}

/** Abscisse (axe x) ou ordonnée (axe y) de chaque directrice : x = …, y = …. */
export function directrices(C: Conique): Ex[] {
  const base = C.axe === "x" ? C.h : C.k;
  if (C.nature === "parabole") return [ex(base - (C.sens * C.p) / 2)];
  // a²/c = a²·√(c²)/c²
  const c = cEx(C);
  const d = c.r === 0 ? ex(C.a2 / c.q) : ex(0, C.a2 / (c.r * c.n), c.n);
  return [plus(ex(base), d), plus(ex(base), oppose(d))];
}
export const lettreAxe = (C: Conique) => (C.axe === "x" ? "x" : "y");
export const directriceL = (C: Conique, v: Ex) => `${lettreAxe(C)}=${exL(v)}`;
export const directriceD = (C: Conique, v: Ex): D => (C.axe === "x" ? { a: 1, b: 0, c: -val(v) } : { a: 0, b: 1, c: -val(v) });

/** Pente positive des asymptotes de l'hyperbole (b/a si l'axe focal est horizontal, a/b sinon). */
export const penteAsymptote = (C: Conique) => (C.axe === "x" ? Math.sqrt(C.b2 / C.a2) : Math.sqrt(C.a2 / C.b2));
/** Asymptotes y − k = ±m(x − h). */
export function asymptotes(C: Conique): D[] {
  const m = penteAsymptote(C);
  return [1, -1].map((s) => droiteEntiere({ a: s * m, b: -1, c: C.k - s * m * C.h }));
}
/** « y=\dfrac{4}{3}x+2 » (forme explicite, comme au cours). */
export function asymptoteL(d: D): string {
  const m = -d.a / d.b;
  const p = -d.c / d.b;
  const mx = net(m) === 1 ? "x" : net(m) === -1 ? "-x" : `${nb(m)}x`;
  return `y=${mx}${net(p) === 0 ? "" : net(p) > 0 ? `+${nb(p)}` : nb(p)}`;
}
export { equationCours };

/** Excentricité e = c/a (1 pour la parabole). */
export const excentricite = (C: Conique): Ex => (C.nature === "parabole" ? ex(1) : racineEx(c2(C) / C.a2));

// ---------------------------------------------------------------------------------------------
// Équations
// ---------------------------------------------------------------------------------------------

/** « (x-2) », « x », « (y+\dfrac{1}{2}) ». */
export function facteurL(v: string, c: number): string {
  if (net(c) === 0) return v;
  return `(${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))})`;
}
const carreL = (v: string, c: number) => `${facteurL(v, c)}^2`;

/** Équation réduite dans le repère donné (`prime` : repère translaté, lettres x′, y′, centre O′). */
export function equationReduiteL(C: Conique, prime = false): string {
  const vx = prime ? "x'" : "x";
  const vy = prime ? "y'" : "y";
  const h = prime ? 0 : C.h;
  const k = prime ? 0 : C.k;
  const X = carreL(vx, h);
  const Y = carreL(vy, k);
  const fr = (num: string, den: number) => (den === 1 ? num : `\\dfrac{${num}}{${nb(den)}}`);
  if (C.nature === "ellipse") return C.axe === "x" ? `${fr(X, C.a2)}+${fr(Y, C.b2)}=1` : `${fr(X, C.b2)}+${fr(Y, C.a2)}=1`;
  if (C.nature === "hyperbole") return C.axe === "x" ? `${fr(X, C.a2)}-${fr(Y, C.b2)}=1` : `${fr(Y, C.a2)}-${fr(X, C.b2)}=1`;
  const deuxP = 2 * C.sens * C.p;
  if (C.axe === "x") return `${Y}=${nb(deuxP)}${facteurL(vx, h)}`;
  return `${X}=${nb(deuxP)}${facteurL(vy, k)}`;
}

/** Polynôme (x, y) de la conique, dénominateurs chassés (coefficients entiers). */
export function poly(C: Conique, h = C.h, k = C.k): Poly {
  const carre = (coef: number, c: number, lin: "x" | "y"): Poly => (lin === "x" ? { x2: coef, x: -2 * coef * c, "1": coef * c * c } : { y2: coef, y: -2 * coef * c, "1": coef * c * c });
  const add = (...ps: Poly[]): Poly => {
    const r: Poly = {};
    for (const p of ps) for (const [m, v] of Object.entries(p) as [keyof Poly, number][]) r[m] = (r[m] ?? 0) + v;
    return r;
  };
  if (C.nature === "parabole") {
    const deuxP = 2 * C.sens * C.p;
    return C.axe === "x" ? add(carre(1, k, "y"), { x: -deuxP, "1": deuxP * h }) : add(carre(1, h, "x"), { y: -deuxP, "1": deuxP * k });
  }
  const [cx, cy] = C.axe === "x" ? [C.b2, C.a2] : [C.a2, C.b2];
  const sx = C.nature === "hyperbole" && C.axe === "y" ? -1 : 1;
  const sy = C.nature === "hyperbole" && C.axe === "x" ? -1 : 1;
  return add(carre(sx * cx, h, "x"), carre(sy * cy, k, "y"), { "1": -C.a2 * C.b2 });
}

/** Polynôme à coefficients entiers premiers entre eux, multiplié par `signe`. */
export function polyEntier(p: Poly, signe = 1): Poly {
  const vals = Object.values(p).filter((v) => v !== undefined && net(v) !== 0).map((v) => Math.abs(Math.round(v!)));
  const g = vals.reduce((u, v) => pgcd(u, v), 0) || 1;
  const r: Poly = {};
  for (const [m, v] of Object.entries(p) as [keyof Poly, number][]) if (net(v) !== 0) r[m] = (signe * Math.round(v)) / g;
  return r;
}

export const evalConique = (C: Conique) => (q: P) => evalPoly(poly(C), q.x, q.y);

// ---------------------------------------------------------------------------------------------
// Tracé (points de la courbe, branche par branche)
// ---------------------------------------------------------------------------------------------

export function branches(C: Conique, etendue = 12): P[][] {
  const pt = (s: number, t: number): P => (C.axe === "x" ? { x: C.h + s, y: C.k + t } : { x: C.h + t, y: C.k + s });
  const n = 160;
  if (C.nature === "ellipse") {
    const a = Math.sqrt(C.a2);
    const b = Math.sqrt(C.b2);
    return [[...Array(n + 1).keys()].map((i) => pt(a * Math.cos((2 * Math.PI * i) / n), b * Math.sin((2 * Math.PI * i) / n)))];
  }
  if (C.nature === "hyperbole") {
    const a = Math.sqrt(C.a2);
    const b = Math.sqrt(C.b2);
    const U = Math.acosh(Math.max(1.5, (etendue + a) / a));
    return [1, -1].map((s) => [...Array(n + 1).keys()].map((i) => {
      const u = -U + (2 * U * i) / n;
      return pt(s * a * Math.cosh(u), b * Math.sinh(u));
    }));
  }
  const T = Math.sqrt(2 * C.p * etendue);
  return [[...Array(n + 1).keys()].map((i) => {
    const t = -T + (2 * T * i) / n;
    return pt((C.sens * t * t) / (2 * C.p), t);
  })];
}

export const NOM_NATURE: Record<Nature, string> = { ellipse: "ellipse", hyperbole: "hyperbole", parabole: "parabole" };
