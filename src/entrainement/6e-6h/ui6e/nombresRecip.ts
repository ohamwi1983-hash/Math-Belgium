import type { Q } from "./nombresExp";
import { q, qL, qLi } from "./nombresExp";

/**
 * Écritures exactes partagées par 6gen152–6gen155 (6e ch. 1, lot G de l'audit) : multiples de π,
 * valeurs remarquables de sin / cos / tan, nombres c·√r (c rationnel, r sans facteur carré) avec
 * simplification de racine et dénominateur rendu rationnel. Tout ce qui sort d'ici est du LaTeX
 * (« − » de LaTeX, `\dfrac`), jamais une notation clavier.
 */

export { q, qL, qLi };
export type { Q };

// ============================================================================
// Multiples de π : θ = n·π/d (fraction réduite).
// ============================================================================

/** n·π/d en LaTeX : « 0 », « \pi », « -\pi », « 2\pi », « \dfrac{5\pi}{6} », « -\dfrac{\pi}{3} ». */
export function piL(n: number, d = 1, frac = "\\dfrac"): string {
  const r = q(n, d);
  if (r.n === 0) return "0";
  const s = r.n < 0 ? "-" : "";
  const a = Math.abs(r.n);
  const num = a === 1 ? "\\pi" : `${a}\\pi`;
  return r.d === 1 ? `${s}${num}` : `${s}${frac}{${num}}{${r.d}}`;
}

/** Même angle, entre parenthèses s'il est négatif (« \left(-\dfrac{\pi}{3}\right) »). */
export function piLP(n: number, d = 1): string {
  const s = piL(n, d);
  return s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

/** Valeur numérique de n·π/d. */
export const piV = (n: number, d = 1): number => (n * Math.PI) / d;

/** Angle en douzièmes de π (k·π/12), si c'en est un. */
export function douziemes(x: number): number | null {
  const k = Math.round((x / Math.PI) * 12);
  return Math.abs((k * Math.PI) / 12 - x) < 1e-9 ? k : null;
}

// ============================================================================
// Nombres c·√r.
// ============================================================================

export interface Rad {
  /** Coefficient rationnel. */
  c: Q;
  /** Radicande sans facteur carré (1 = rationnel). */
  r: number;
}

/** Extrait les carrés de √n (n entier ≥ 0) : √n = k·√m. */
export function extraireCarre(n: number): { k: number; m: number } {
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return { k, m };
}

export const radV = (x: Rad): number => (x.c.n / x.c.d) * Math.sqrt(x.r);

/** Racine carrée d'un rationnel positif p/q, simplifiée (dénominateur rationnel). */
export function racineQ(x: Q): Rad {
  // √(n/d) = √(n·d)/d
  const { k, m } = extraireCarre(x.n * x.d);
  return { c: q(k, x.d), r: m };
}

export function radMul(a: Rad, b: Rad): Rad {
  const { k, m } = extraireCarre(a.r * b.r);
  return { c: q(a.c.n * b.c.n * k, a.c.d * b.c.d), r: m };
}

export function radDiv(a: Rad, b: Rad): Rad {
  // (c₁√r₁)/(c₂√r₂) = (c₁/(c₂·r₂))·√(r₁r₂)
  const { k, m } = extraireCarre(a.r * b.r);
  return { c: q(a.c.n * b.c.d * k, a.c.d * b.c.n * b.r), r: m };
}

export const radNeg = (a: Rad): Rad => ({ c: q(-a.c.n, a.c.d), r: a.r });
export const radQ = (x: Q): Rad => ({ c: x, r: 1 });

/** c·√r en LaTeX : « \dfrac{2\sqrt{2}}{3} », « -\sqrt{3} », « \dfrac{4}{5} », « 2\sqrt{5} ». */
export function radL(x: Rad, frac = "\\dfrac"): string {
  if (x.c.n === 0) return "0";
  if (x.r === 1) return qL(x.c, frac);
  const s = x.c.n < 0 ? "-" : "";
  const a = Math.abs(x.c.n);
  const num = `${a === 1 ? "" : a}\\sqrt{${x.r}}`;
  return x.c.d === 1 ? `${s}${num}` : `${s}${frac}{${num}}{${x.c.d}}`;
}

/** Rationnel entre parenthèses s'il est négatif ou fractionnaire (pour l'élever au carré). */
export function qP(x: Q): string {
  return x.d === 1 && x.n >= 0 ? `${x.n}` : `\\left(${qL(x)}\\right)`;
}

// ============================================================================
// Valeurs remarquables (angles multiples de π/6 et π/4).
// ============================================================================

const RAC: Record<string, Rad> = {
  "0": radQ(q(0)),
  "1/2": radQ(q(1, 2)),
  "r2/2": { c: q(1, 2), r: 2 },
  "r3/2": { c: q(1, 2), r: 3 },
  "1": radQ(q(1)),
};

/** Valeur exacte de sin(k·π/12), cos(k·π/12), tan(k·π/12) (k multiple de 2 ou de 3) ; `null` si non
 * remarquable ou non définie. */
export function trigExact(fn: "sin" | "cos" | "tan", k12: number): Rad | null {
  if (k12 % 2 !== 0 && k12 % 3 !== 0) return null;
  const v = fn === "sin" ? Math.sin((k12 * Math.PI) / 12) : fn === "cos" ? Math.cos((k12 * Math.PI) / 12) : Math.tan((k12 * Math.PI) / 12);
  if (fn === "tan" && Math.abs(Math.cos((k12 * Math.PI) / 12)) < 1e-12) return null;
  const cands: Rad[] =
    fn === "tan" ? [radQ(q(0)), { c: q(1, 3), r: 3 }, radQ(q(1)), { c: q(1), r: 3 }] : [RAC["0"], RAC["1/2"], RAC["r2/2"], RAC["r3/2"], RAC["1"]];
  for (const c of cands) {
    if (Math.abs(radV(c) - Math.abs(v)) < 1e-9) return v < 0 ? radNeg(c) : c;
  }
  return null;
}

/** « \sin\dfrac{5\pi}{6} », « \cos\left(-\dfrac{\pi}{3}\right) », « \tan\left(\pi\right) ». */
export function trigAngleL(fn: "sin" | "cos" | "tan", n: number, d = 1): string {
  const a = piL(n, d);
  return a.startsWith("\\dfrac") ? `\\${fn}${a}` : `\\${fn}\\left(${a}\\right)`;
}
