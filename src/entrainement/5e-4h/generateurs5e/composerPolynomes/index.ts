import type { ExerciceComposerPolynomes, VarianteComposerPolynomes } from "../../core5e/composerPolynomes";
import { composerP, evalP } from "../../moteur5e/polynomeSaisi";

export type IdVarianteComposerPolynomes = VarianteComposerPolynomes;

/**
 * Couche A — générateur de `5gen61` « Composer des polynômes ». `Math.random()` seul (le `?code=`
 * rejoue le tirage).
 * - « affines » : f(x) = mx + p, g(x) = m'x + p'. Verdict f∘g = g∘f tiré 50/50 AVANT les nombres :
 *   « égales » = même point fixe r (f(x) = m(x − r) + r, g idem, m ≠ m') ou deux translations ;
 *   « différentes » = p(1 − m') ≠ p'(1 − m). Jamais f = g ni l'identité.
 * - « secondDegre » : une fonction ax² + bx + c (a ∈ {±1, ±2, 3}, b nul 40 % du temps — comme
 *   l'exemple du cours x² + 1) et une affine mx + p (p ≠ 0, jamais l'identité) ; la parabole est f
 *   (60 %, (f∘g) demande alors le carré (mx + p)²) ou g.
 * Coefficients des composées bornés (|·| ≤ 60), point a ∈ {−2 ; −1 ; 1 ; 2 ; 3} avec |g(a)| ≤ 8 et
 * |f(g(a))| ≤ 99, g(a) ≠ a (sinon la vérification ne distingue pas f(a) de f(g(a))).
 */

const ent = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
const nonNul = (a: number, b: number) => {
  for (;;) {
    const x = ent(a, b);
    if (x !== 0) return x;
  }
};
const egaux = (u: number[], v: number[]) => u.length === v.length && u.every((x, i) => x === v[i]);

export const PART_EGALES = 0.5;

function paireAffines(commutent: boolean): [number[], number[]] {
  for (;;) {
    let f: number[];
    let g: number[];
    if (commutent) {
      if (Math.random() < 0.7) {
        const r = nonNul(-3, 3);
        const m = parmi([-3, -2, -1, 2, 3]);
        const m2 = parmi([-3, -2, -1, 2, 3]);
        if (m === m2) continue;
        f = [r * (1 - m), m];
        g = [r * (1 - m2), m2];
      } else {
        const p = nonNul(-7, 7);
        const p2 = nonNul(-7, 7);
        if (p === p2) continue;
        f = [p, 1];
        g = [p2, 1];
      }
    } else {
      const m = parmi([-3, -2, -1, 1, 2, 3]);
      const m2 = parmi([-3, -2, -1, 1, 2, 3]);
      if (m === 1 && m2 === 1) continue;
      const p = ent(-7, 7);
      const p2 = ent(-7, 7);
      f = [p, m];
      g = [p2, m2];
      if ((m === 1 && p === 0) || (m2 === 1 && p2 === 0)) continue;
      if (p * (1 - m2) === p2 * (1 - m)) continue;
    }
    if (egaux(f, g) || Math.abs(f[0]) > 12 || Math.abs(g[0]) > 12) continue;
    return [f, g];
  }
}

function paireSecondDegre(): { f: number[]; g: number[]; quadratique: "f" | "g" } {
  const a = parmi([1, 1, -1, 2, -2, 3]);
  const b = Math.random() < 0.4 ? 0 : nonNul(-4, 4);
  const c = Math.random() < 0.15 ? 0 : nonNul(-5, 5);
  const m = parmi([2, -2, 3, -3, -1, 1]);
  const p = nonNul(-5, 5);
  const quad = [c, b, a];
  const aff = [p, m];
  return Math.random() < 0.6 ? { f: quad, g: aff, quadratique: "f" } : { f: aff, g: quad, quadratique: "g" };
}

function construire(variante: VarianteComposerPolynomes): ExerciceComposerPolynomes {
  const commutent = variante === "affines" ? Math.random() < PART_EGALES : false;
  for (;;) {
    let f: number[];
    let g: number[];
    let quadratique: "f" | "g" | null = null;
    if (variante === "affines") [f, g] = paireAffines(commutent);
    else ({ f, g, quadratique } = paireSecondDegre());
    const fog = composerP(f, g);
    const gof = composerP(g, f);
    if ([...fog, ...gof].some((x) => Math.abs(x) > 60)) continue;
    // Une composée de degré inférieur (coefficient dominant nul) ne sort pas avec ces coefficients.
    const points = [-2, -1, 1, 2, 3].filter((x) => {
      const gx = evalP(g, x);
      const fgx = evalP(f, gx);
      return Math.abs(gx) <= 8 && Math.abs(fgx) <= 99 && gx !== x && fgx !== evalP(f, x);
    });
    if (points.length === 0) continue;
    const a = parmi(points);
    const ga = evalP(g, a);
    const fga = evalP(f, ga);
    return {
      variante,
      f,
      g,
      fog,
      gof,
      a,
      ga,
      fga,
      commutent,
      quadratique,
      cleCollecteur: variante === "affines" ? `affines/${commutent ? "egales" : "differentes"}` : `secondDegre/${quadratique}${f.length === 3 && f[1] === 0 ? "-b0" : ""}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteComposerPolynomes; label: string }[] = [
  { id: "affines", label: "Deux fonctions affines" },
  { id: "secondDegre", label: "Une fonction du second degré et une affine" },
];

export function construireAvecVarianteId(id: IdVarianteComposerPolynomes): ExerciceComposerPolynomes {
  return construire(id);
}

/** Pour les mesures : forcer le verdict (affines). */
export function construireAffinesVerdict(commutent: boolean): ExerciceComposerPolynomes {
  for (;;) {
    const e = construire("affines");
    if (e.commutent === commutent) return e;
  }
}

export function genererExerciceComposerPolynomes(): ExerciceComposerPolynomes {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
