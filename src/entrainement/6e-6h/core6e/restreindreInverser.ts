import type { Q } from "../../5e-4h/ui5e/nombresTrigo";
import { q, qVal } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche core — `6gen159` « Restreindre pour inverser » (6e ch. 1, § 1–2, processus 2 APPLIQUER ; lot G
 * de l'audit, prolonge « le plus court intervalle contenant 0 »). Une fonction non injective (trinôme,
 * sin, cos, tan) est restreinte au plus grand intervalle contenant x₀ sur lequel elle est strictement
 * monotone ; g est la réciproque de cette restriction.
 *
 * Décomposition :
 * a. l'intervalle de restriction (entre deux extremums consécutifs, ou deux asymptotes ; sommet du
 *    trinôme du côté de x₀) ;
 * b. trinôme : l'image de la restriction (= domaine de g) ; trigonométrique : g(y₀), l'angle DE
 *    L'INTERVALLE dont le sinus (cosinus, tangente) vaut y₀ — pas la valeur principale ;
 * c. g(x) : trinôme, on isole x (signe de la racine imposé par la restriction) ; trigonométrique,
 *    g(x) = jπ ± arc x (sin(π − a) = sin a, cos(2π − a) = cos a, tan(a + π) = tan a…).
 *
 * Variantes : `trinome` (a = ±1, sommet entier, x₀ à gauche ou à droite 50/50), `sinus`, `cosinus`,
 * `tangente` (restriction autre que la restriction principale du cours).
 */

export type VarianteRestreindre = "trinome" | "sinus" | "cosinus" | "tangente";

/** Valeur remarquable y₀ (texte saisi, LaTeX) et valeur principale arc(y₀) en multiples de π. */
export interface ValeurY0 {
  v: number;
  l: string;
  t: string;
  /** arcsin / arccos / arctan (y₀), en multiples de π. */
  principale: Q;
}

export type ExerciceRestreindre =
  | { variante: "trinome"; a: 1 | -1; h: number; k: number; s: 1 | -1; x0: number; cleCollecteur: string }
  | { variante: "sinus" | "cosinus" | "tangente"; j: number; x0: Q; y0: ValeurY0; cleCollecteur: string };

export type ExTrinome = Extract<ExerciceRestreindre, { variante: "trinome" }>;
export type ExTrig = Extract<ExerciceRestreindre, { variante: "sinus" | "cosinus" | "tangente" }>;

const S2 = Math.SQRT2 / 2;
const S3 = Math.sqrt(3) / 2;

export const Y0_SIN: ValeurY0[] = [
  { v: 0.5, l: "\\dfrac{1}{2}", t: "1/2", principale: q(1, 6) },
  { v: -0.5, l: "-\\dfrac{1}{2}", t: "−1/2", principale: q(-1, 6) },
  { v: S2, l: "\\dfrac{\\sqrt{2}}{2}", t: "√2/2", principale: q(1, 4) },
  { v: -S2, l: "-\\dfrac{\\sqrt{2}}{2}", t: "−√2/2", principale: q(-1, 4) },
  { v: S3, l: "\\dfrac{\\sqrt{3}}{2}", t: "√3/2", principale: q(1, 3) },
  { v: -S3, l: "-\\dfrac{\\sqrt{3}}{2}", t: "−√3/2", principale: q(-1, 3) },
];
export const Y0_COS: ValeurY0[] = Y0_SIN.map((y) => ({ ...y, principale: acosQ(y.v) }));
function acosQ(v: number): Q {
  const table: [number, Q][] = [
    [0.5, q(1, 3)],
    [-0.5, q(2, 3)],
    [S2, q(1, 4)],
    [-S2, q(3, 4)],
    [S3, q(1, 6)],
    [-S3, q(5, 6)],
  ];
  return table.find(([x]) => Math.abs(x - v) < 1e-12)![1];
}
export const Y0_TAN: ValeurY0[] = [
  { v: 1, l: "1", t: "1", principale: q(1, 4) },
  { v: -1, l: "-1", t: "−1", principale: q(-1, 4) },
  { v: Math.sqrt(3), l: "\\sqrt{3}", t: "√3", principale: q(1, 3) },
  { v: -Math.sqrt(3), l: "-\\sqrt{3}", t: "−√3", principale: q(-1, 3) },
  { v: Math.sqrt(3) / 3, l: "\\dfrac{\\sqrt{3}}{3}", t: "√3/3", principale: q(1, 6) },
  { v: -Math.sqrt(3) / 3, l: "-\\dfrac{\\sqrt{3}}{3}", t: "−√3/3", principale: q(-1, 6) },
];

/** Bornes de la restriction (multiples de π pour sin, cos, tan ; entiers ±∞ pour le trinôme). */
export function bornesTrig(e: ExTrig): [Q, Q] {
  switch (e.variante) {
    case "sinus":
      return [q(2 * e.j + 1, 2), q(2 * e.j + 3, 2)];
    case "cosinus":
      return [q(e.j), q(e.j + 1)];
    case "tangente":
      return [q(2 * e.j - 1, 2), q(2 * e.j + 1, 2)];
  }
}

const add = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
const neg = (a: Q): Q => q(-a.n, a.d);

/** g(y₀) en multiples de π : l'angle de la restriction dont la fonction vaut y₀. */
export function gY0(e: ExTrig): Q {
  const a = e.y0.principale;
  switch (e.variante) {
    case "sinus":
      return add(q(e.j + 1), (e.j + 1) % 2 === 0 ? a : neg(a));
    case "cosinus":
      return add(q(e.j), Math.abs(e.j) % 2 === 0 ? a : add(q(1), neg(a)));
    case "tangente":
      return add(q(e.j), a);
  }
}

/** g(x) (réciproque de la restriction). */
export function g(e: ExerciceRestreindre, x: number): number {
  if (e.variante === "trinome") {
    const r = (x - e.k) / e.a;
    return r < 0 ? NaN : e.h + e.s * Math.sqrt(r);
  }
  switch (e.variante) {
    case "sinus":
      return Math.abs(x) > 1 ? NaN : (e.j + 1) * Math.PI + ((e.j + 1) % 2 === 0 ? 1 : -1) * Math.asin(x);
    case "cosinus":
      return Math.abs(x) > 1 ? NaN : e.j * Math.PI + (Math.abs(e.j) % 2 === 0 ? Math.acos(x) : Math.PI - Math.acos(x));
    case "tangente":
      return Math.atan(x) + e.j * Math.PI;
  }
}

/** f(x) (fonction de départ, sur ℝ). */
export function f(e: ExerciceRestreindre, x: number): number {
  switch (e.variante) {
    case "trinome":
      return e.a * (x - e.h) ** 2 + e.k;
    case "sinus":
      return Math.sin(x);
    case "cosinus":
      return Math.cos(x);
    case "tangente":
      return Math.tan(x);
  }
}

export const x0V = (e: ExerciceRestreindre): number => (e.variante === "trinome" ? e.x0 : qVal(e.x0) * Math.PI);
