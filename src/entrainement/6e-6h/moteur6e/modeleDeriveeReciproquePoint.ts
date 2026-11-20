import type { ExerciceDeriveeReciproque, FamilleReciproque } from "../core6e/deriveeReciproquePoint.types";
import { coefL, termeL } from "../ui6e/nombresExp";
import { piL, q, qL } from "../ui6e/nombresRecip";
import type { Q } from "../ui6e/nombresRecip";

/**
 * Modèle de `6gen155` « Dérivée d'une réciproque en un point ». À partir des paramètres de la famille
 * et de l'indice de x₀ : f et f′ (fonctions et LaTeX), l'intervalle I, y₀ = f(x₀) exact, f′(x₀),
 * 1/f′(x₀), et les chaînes de calcul du corrigé (f(x₀), f′(x₀), inverse). Une seule source pour
 * l'écran, le papier et le corrigé.
 */

type E = ExerciceDeriveeReciproque;

/** Nombre exact a·e + b·π + r (a entier, b et r rationnels). */
export interface Exact {
  e: number;
  pi: Q;
  r: Q;
}
const ex = (r: Q, pi: Q = q(0), e = 0): Exact => ({ e, pi, r });
export const exactV = (x: Exact): number => x.e * Math.E + (x.pi.n / x.pi.d) * Math.PI + x.r.n / x.r.d;

/** « e+3 », « \dfrac{\pi}{2}+4 », « 2e-1 », « -\dfrac{\pi}{4}+1 », « 7 ». */
export function exactL(x: Exact): string {
  const parts: string[] = [];
  if (x.e !== 0) parts.push(`${coefL(x.e)}e`);
  if (x.pi.n !== 0) {
    const s = piL(x.pi.n, x.pi.d);
    parts.push(parts.length && !s.startsWith("-") ? `+${s}` : s);
  }
  if (x.r.n !== 0 || parts.length === 0) {
    const s = qL(x.r);
    parts.push(parts.length && !s.startsWith("-") ? `+${s}` : s);
  }
  return parts.join("");
}

export interface PointReciproque {
  x0L: string;
  x0V: number;
  y0: Exact;
  /** f′(x₀) (LaTeX) et sa valeur. */
  fpL: string;
  fpV: number;
  /** 1/f′(x₀) sous forme simplifiée (si f′(x₀) ≠ 0). */
  invL: string;
  /** Chaînes de calcul : f(x₀) = … = y₀ ; f′(x₀) = … ; 1/f′(x₀) = … (membres après le premier « = »). */
  chaineF: string[];
  chaineFp: string[];
  chaineInv: string[];
}

export interface ModeleReciproque {
  fL: string;
  fpxL: string;
  IL: string;
  f: (x: number) => number;
  fp: (x: number) => number;
  /** Valeurs évidentes proposées en aide (LaTeX). */
  evidentes: string[];
  point: PointReciproque;
}

const par = (s: string): string => (s.startsWith("-") ? `\\left(${s}\\right)` : s);
const inverseL = (fp: Q): string => qL(q(fp.d, fp.n));

// ============================================================================
// Polynôme : f(x) = x³ − 3h x² + (3h² + p) x + q.
// ============================================================================

export const X0_POLY = [-1, 0, 1, 2];

function polyL(coefs: [number, number][]): string {
  // coefs : [coef, puissance], puissances décroissantes
  let s = "";
  for (const [c, p] of coefs) {
    if (c === 0) continue;
    const corps = p === 0 ? `${Math.abs(c)}` : `${Math.abs(c) === 1 ? "" : Math.abs(c)}x${p > 1 ? `^{${p}}` : ""}`;
    s += s === "" ? `${c < 0 ? "-" : ""}${corps}` : `${c < 0 ? "-" : "+"}${corps}`;
  }
  return s || "0";
}

/** Chaîne « (−1)^{3}−3·(−1)^{2}+4·(−1)+2 », « =−1−3−4+2 », « =−6 ». */
function chainePoly(coefs: [number, number][], x: number): string[] {
  const xs = par(`${x}`);
  let sub = "";
  let vals = "";
  let total = 0;
  for (const [c, p] of coefs) {
    if (c === 0) continue;
    const t = p === 0 ? `${Math.abs(c)}` : `${Math.abs(c) === 1 ? "" : `${Math.abs(c)}\\cdot `}${xs}${p > 1 ? `^{${p}}` : ""}`;
    sub += sub === "" ? `${c < 0 ? "-" : ""}${t}` : `${c < 0 ? "-" : "+"}${t}`;
    const v = c * x ** p;
    total += v;
    vals += vals === "" ? `${v}` : v < 0 ? `${v}` : `+${v}`;
  }
  const out = [sub];
  if (vals !== sub && vals !== `${total}`) out.push(vals);
  out.push(`${total}`);
  return out.filter((x2, i) => i === 0 || x2 !== out[i - 1]);
}

function modelePoly(p: Record<string, number>, ix0: number): ModeleReciproque {
  const { h, pp, c } = p;
  const A = -3 * h;
  const B = 3 * h * h + pp;
  const coefs: [number, number][] = [
    [1, 3],
    [A, 2],
    [B, 1],
    [c, 0],
  ];
  const der: [number, number][] = [
    [3, 2],
    [2 * A, 1],
    [B, 0],
  ];
  const f = (x: number) => x ** 3 + A * x * x + B * x + c;
  const fp = (x: number) => 3 * x * x + 2 * A * x + B;
  const x0 = X0_POLY[ix0];
  const y0 = f(x0);
  const fpv = fp(x0);
  return {
    fL: polyL(coefs),
    fpxL: polyL(der),
    IL: "\\mathbb{R}",
    f,
    fp,
    evidentes: X0_POLY.map(String),
    point: {
      x0L: `${x0}`,
      x0V: x0,
      y0: ex(q(y0)),
      fpL: `${fpv}`,
      fpV: fpv,
      invL: fpv === 0 ? "" : inverseL(q(fpv)),
      chaineF: chainePoly(coefs, x0),
      chaineFp: chainePoly(der, x0),
      chaineInv: fpv === 0 ? [] : [`\\dfrac{1}{${fpv}}`].filter((s) => s !== `\\dfrac{1}{1}`).concat(fpv === 1 ? ["1"] : []),
    },
  };
}

// ============================================================================
// Exponentielle : f(x) = eˣ + kx + c (k ∈ {−1, 1, 2, 3} ; k = −1 sur [0 ; +∞[).
// ============================================================================

export const X0_EXP = [0, 1];

function modeleExp(p: Record<string, number>, ix0: number): ModeleReciproque {
  const { k, c } = p;
  const f = (x: number) => Math.exp(x) + k * x + c;
  const fp = (x: number) => Math.exp(x) + k;
  const x0 = X0_EXP[ix0];
  const kx = (x: string) => (k === 1 ? `+${x}` : k === -1 ? `-${x}` : `${termeL(k)}\\cdot ${x}`);
  let point: PointReciproque;
  if (x0 === 0) {
    const fpv = 1 + k;
    point = {
      x0L: "0",
      x0V: 0,
      y0: ex(q(1 + c)),
      fpL: `${fpv}`,
      fpV: fpv,
      invL: fpv === 0 ? "" : inverseL(q(fpv)),
      chaineF: [`e^{0}${kx("0")}${termeL(c)}`, `${1 + c}`],
      chaineFp: [`e^{0}${termeL(k)}`, `${fpv}`],
      chaineInv: fpv === 0 ? [] : [`\\dfrac{1}{${fpv}}`, ...(fpv === 1 ? ["1"] : [])],
    };
  } else {
    point = {
      x0L: "1",
      x0V: 1,
      y0: ex(q(k + c), q(0), 1),
      fpL: `e${termeL(k)}`,
      fpV: Math.E + k,
      invL: `\\dfrac{1}{e${termeL(k)}}`,
      chaineF: [`e^{1}${kx("1")}${termeL(c)}`, exactL(ex(q(k + c), q(0), 1))],
      chaineFp: [`e^{1}${termeL(k)}`, `e${termeL(k)}`],
      chaineInv: [`\\dfrac{1}{e${termeL(k)}}`],
    };
  }
  return {
    fL: `e^{x}${k === 1 ? "+x" : k === -1 ? "-x" : `${termeL(k)}x`}${termeL(c)}`,
    fpxL: `e^{x}${termeL(k)}`,
    IL: k > 0 ? "\\mathbb{R}" : "\\left[0\\,;\\,+\\infty\\right[",
    f,
    fp,
    evidentes: ["0", "1"],
    point,
  };
}

// ============================================================================
// Logarithme : type 0 : ln x + kx + c sur ]0 ; +∞[ ; type 1 : x − ln x + c sur [1 ; +∞[.
// ============================================================================

export const X0_LN = ["1", "e"];

function modeleLn(p: Record<string, number>, ix0: number): ModeleReciproque {
  const { type, k, c } = p;
  const enE = ix0 === 1;
  if (type === 0) {
    const f = (x: number) => Math.log(x) + k * x + c;
    const fp = (x: number) => 1 / x + k;
    const point: PointReciproque = enE
      ? {
          x0L: "e",
          x0V: Math.E,
          y0: ex(q(1 + c), q(0), k),
          fpL: `\\dfrac{1}{e}+${k}`,
          fpV: 1 / Math.E + k,
          invL: `\\dfrac{e}{1+${k}e}`,
          chaineF: [`\\ln e+${k === 1 ? "" : `${k}\\cdot `}e${termeL(c)}`, `1+${coefL(k)}e${termeL(c)}`, exactL(ex(q(1 + c), q(0), k))],
          chaineFp: [`\\dfrac{1}{e}+${k}`],
          chaineInv: [`\\dfrac{1}{\\frac{1}{e}+${k}}`, `\\dfrac{e}{1+${k}e}`],
        }
      : {
          x0L: "1",
          x0V: 1,
          y0: ex(q(k + c)),
          fpL: `${1 + k}`,
          fpV: 1 + k,
          invL: inverseL(q(1 + k)),
          chaineF: [`\\ln 1+${k === 1 ? "1" : `${k}\\cdot 1`}${termeL(c)}`, `${k + c}`],
          chaineFp: [`\\dfrac{1}{1}+${k}`, `${1 + k}`],
          chaineInv: [`\\dfrac{1}{${1 + k}}`],
        };
    return { fL: `\\ln x${k === 1 ? "+x" : `+${k}x`}${termeL(c)}`, fpxL: `\\dfrac{1}{x}+${k}`, IL: "\\mathopen{]}0\\,;\\,+\\infty\\mathclose{[}", f, fp, evidentes: ["1", "e"], point };
  }
  const f = (x: number) => x - Math.log(x) + c;
  const fp = (x: number) => 1 - 1 / x;
  const point: PointReciproque = enE
    ? {
        x0L: "e",
        x0V: Math.E,
        y0: ex(q(c - 1), q(0), 1),
        fpL: "1-\\dfrac{1}{e}",
        fpV: 1 - 1 / Math.E,
        invL: "\\dfrac{e}{e-1}",
        chaineF: [`e-\\ln e${termeL(c)}`, exactL(ex(q(c - 1), q(0), 1))],
        chaineFp: ["1-\\dfrac{1}{e}"],
        chaineInv: ["\\dfrac{1}{1-\\frac{1}{e}}", "\\dfrac{e}{e-1}"],
      }
    : {
        x0L: "1",
        x0V: 1,
        y0: ex(q(1 + c)),
        fpL: "0",
        fpV: 0,
        invL: "",
        chaineF: [`1-\\ln 1${termeL(c)}`, `${1 + c}`],
        chaineFp: ["1-\\dfrac{1}{1}", "0"],
        chaineInv: [],
      };
  return { fL: `x-\\ln x${termeL(c)}`, fpxL: "1-\\dfrac{1}{x}", IL: "\\left[1\\,;\\,+\\infty\\right[", f, fp, evidentes: ["1", "e"], point };
}

// ============================================================================
// Trigonométrique : f(x) = kx + s·g(x) + c, g = sin ou cos.
// ============================================================================

/** x₀ en quarts de π : −π/2, 0, π/2, π. */
export const X0_TRIG = [-2, 0, 2, 4];

/** Configurations (k, g, s) : g = 0 sin, 1 cos. */
export const CONFIGS_TRIG: [number, number, number][] = [
  [1, 0, 1],
  [1, 0, -1],
  [1, 1, 1],
  [1, 1, -1],
  [2, 0, 1],
  [2, 1, -1],
];

const sinQ = (k4: number): number => Math.round(Math.sin((k4 * Math.PI) / 4));
const cosQ = (k4: number): number => Math.round(Math.cos((k4 * Math.PI) / 4));

function modeleTrig(p: Record<string, number>, ix0: number): ModeleReciproque {
  const [k, g, s] = CONFIGS_TRIG[p.cfg];
  const c = p.c;
  const nom = g === 0 ? "\\sin" : "\\cos";
  const G = g === 0 ? Math.sin : Math.cos;
  const Gp = g === 0 ? Math.cos : (x: number) => -Math.sin(x);
  const f = (x: number) => k * x + s * G(x) + c;
  const fp = (x: number) => k + s * Gp(x);
  const k4 = X0_TRIG[ix0];
  const gv = g === 0 ? sinQ(k4) : cosQ(k4);
  const gpv = g === 0 ? cosQ(k4) : -sinQ(k4);
  const fpv = k + s * gpv;
  const x0L = piL(k4, 4);
  const xa = k4 === 0 ? " 0" : x0L.startsWith("\\dfrac") ? x0L : `\\left(${x0L}\\right)`;
  const kx0 = k === 1 ? x0L : k4 === 0 ? "2\\cdot 0" : `2\\cdot ${par(x0L)}`;
  const y0 = ex(q(s * gv + c), q(k * k4, 4));
  const gpNom = g === 0 ? "\\cos" : "\\sin";
  return {
    fL: `${coefL(k)}x${s < 0 ? "-" : "+"}${nom} x${termeL(c)}`,
    fpxL: `${k}${g === 0 ? (s < 0 ? "-" : "+") : s < 0 ? "+" : "-"}${gpNom} x`,
    IL: "\\mathbb{R}",
    f,
    fp,
    evidentes: X0_TRIG.map((x) => piL(x, 4)),
    point: {
      x0L,
      x0V: (k4 * Math.PI) / 4,
      y0,
      fpL: `${fpv}`,
      fpV: fpv,
      invL: fpv === 0 ? "" : inverseL(q(fpv)),
      chaineF: [`${kx0}${s < 0 ? "-" : "+"}${nom}${xa}${termeL(c)}`, `${k4 === 0 ? "0" : piL(k * k4, 4)}${termeL(s * gv)}${termeL(c)}`.replace(/^0(?=[+-])/, ""), exactL(y0)].filter((x, i, t) => i === 0 || x !== t[i - 1]),
      chaineFp: [`${k}${g === 0 ? (s < 0 ? "-" : "+") : s < 0 ? "+" : "-"}${gpNom}${xa}`, `${k}${termeL(s * gpv)}`, `${fpv}`],
      chaineInv: fpv === 0 ? [] : [`\\dfrac{1}{${fpv}}`, ...(fpv === 1 ? ["1"] : [])],
    },
  };
}

// ============================================================================
// Arctangente : f(x) = kx + s·arctan x + c.
// ============================================================================

export const X0_ARCTAN = [-1, 0, 1];
export const CONFIGS_ARCTAN: [number, number][] = [
  [1, 1],
  [1, -1],
  [2, -1],
];

function modeleArctan(p: Record<string, number>, ix0: number): ModeleReciproque {
  const [k, s] = CONFIGS_ARCTAN[p.cfg];
  const c = p.c;
  const f = (x: number) => k * x + s * Math.atan(x) + c;
  const fp = (x: number) => k + s / (1 + x * x);
  const x0 = X0_ARCTAN[ix0];
  const fpQ = x0 === 0 ? q(k + s) : q(2 * k + s, 2);
  const fpv = fpQ.n / fpQ.d;
  const y0 = ex(q(k * x0 + c), q(s * x0, 4));
  const xs = par(`${x0}`);
  return {
    fL: `${coefL(k)}x${s < 0 ? "-" : "+"}\\arctan x${termeL(c)}`,
    fpxL: `${k}${s < 0 ? "-" : "+"}\\dfrac{1}{1+x^{2}}`,
    IL: "\\mathbb{R}",
    f,
    fp,
    evidentes: X0_ARCTAN.map(String),
    point: {
      x0L: `${x0}`,
      x0V: x0,
      y0,
      fpL: qL(fpQ),
      fpV: fpv,
      invL: fpv === 0 ? "" : inverseL(fpQ),
      chaineF: [
        `${k === 1 ? xs : `2\\cdot ${xs}`}${s < 0 ? "-" : "+"}\\arctan${par(`${x0}`) === `${x0}` ? ` ${x0}` : xs}${termeL(c)}`,
        x0 === 0 ? "" : `${k * x0}${(() => {
          const a = piL(s * x0, 4);
          return a.startsWith("-") ? a : `+${a}`;
        })()}${termeL(c)}`,
        exactL(y0),
      ].filter((x, i, t) => x !== "" && (i === 0 || x !== t[i - 1])),
      chaineFp: [`${k}${s < 0 ? "-" : "+"}\\dfrac{1}{1+${xs}^{2}}`, `${k}${s < 0 ? "-" : "+"}\\dfrac{1}{${1 + x0 * x0}}`, qL(fpQ)],
      chaineInv: fpv === 0 ? [] : [`\\dfrac{1}{${qL(fpQ, "\\frac")}}`, inverseL(fpQ)].filter((x2, i, t) => i === 0 || x2 !== t[i - 1]),
    },
  };
}

export function modele(e: E): ModeleReciproque {
  switch (e.variante) {
    case "poly":
      return modelePoly(e.p, e.ix0);
    case "exp":
      return modeleExp(e.p, e.ix0);
    case "ln":
      return modeleLn(e.p, e.ix0);
    case "trig":
      return modeleTrig(e.p, e.ix0);
    case "arctan":
      return modeleArctan(e.p, e.ix0);
  }
}

export const applicable = (e: E): boolean => Math.abs(modele(e).point.fpV) > 1e-12;
export const y0L = (e: E): string => exactL(modele(e).point.y0);
export const y0V = (e: E): number => exactV(modele(e).point.y0);

export const FAMILLES: FamilleReciproque[] = ["poly", "exp", "ln", "trig", "arctan"];
