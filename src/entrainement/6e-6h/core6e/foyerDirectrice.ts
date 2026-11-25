import type { Conique, Nature } from "./coniquesLotH1";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { choisir, entier } from "../ui6e/outilsLieuxLotH1";
import type { Poly } from "../ui6e/outilsLieuxLotH2";

/**
 * Couche A — modèle de `6gen135` « Équation depuis foyer, directrice et excentricité » (6e ch. 10, § 2,
 * Appliquer). Repère quelconque : foyer F(x₀ ; y₀) entier hors des axes, directrice d ≡ x = k ou y = k
 * (horizontale une fois sur deux — piège du cours), excentricité e = n/q rationnelle. La NATURE
 * (ellipse e < 1, parabole e = 1, hyperbole e > 1) est le verdict du premier écran, tirée au tiers AVANT
 * les nombres. Écrans : nature, équation cartésienne (|PF|² = e²·dist(P ; d)², toute forme
 * proportionnelle acceptée), sommet situé entre F et d (S partage [FH] avec SF = e·SH, H pied de la
 * perpendiculaire issue de F).
 */

export type Variante135 = "verticale" | "horizontale";
export type Phase135 = "nature" | "equation" | "sommet";

export interface Exercice135 {
  variante: Variante135;
  nature: Nature;
  F: P;
  /** d ≡ x = k (verticale) ou y = k (horizontale). */
  k: number;
  /** e = num / den (fraction irréductible). */
  num: number;
  den: number;
}

export const phases135 = (_e: Exercice135): Phase135[] => ["nature", "equation", "sommet"];
export const eVal = (e: Exercice135) => e.num / e.den;
export const verticale = (e: Exercice135) => e.variante === "verticale";

const EXC: Record<Nature, [number, number][]> = {
  ellipse: [
    [1, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ],
  parabole: [[1, 1]],
  hyperbole: [
    [2, 1],
    [3, 2],
    [3, 1],
    [4, 3],
  ],
};

export function tirer135(variante: Variante135): Exercice135 {
  const nature = choisir<Nature>(["ellipse", "parabole", "hyperbole"]);
  const [num, den] = choisir(EXC[nature]);
  for (;;) {
    const F = { x: entier(-4, 4), y: entier(-4, 4) };
    const k = entier(-5, 5);
    if (F.x === 0 || F.y === 0) continue;
    const coord = variante === "verticale" ? F.x : F.y;
    const D = Math.abs(coord - k);
    if (D < 1 || D > 5) continue;
    return { variante, nature, F, k, num, den };
  }
}

/** Pied H de la perpendiculaire à d issue de F. */
export const pied135 = (e: Exercice135): P => (verticale(e) ? { x: e.k, y: e.F.y } : { x: e.F.x, y: e.k });

/** Sommet entre F et d : S = (F + e·H) / (1 + e). */
export function sommet135(e: Exercice135): P {
  const H = pied135(e);
  const ev = eVal(e);
  return { x: (e.F.x + ev * H.x) / (1 + ev), y: (e.F.y + ev * H.y) / (1 + ev) };
}

/** den²·|PF|² − num²·dist(P ; d)² (coefficients entiers). */
export function poly135(e: Exercice135, carre = true): Poly {
  const q2 = e.den * e.den;
  const n2 = carre ? e.num * e.num : e.num * e.den;
  const { x: a, y: b } = e.F;
  const k = e.k;
  const base: Poly = { x2: q2, y2: q2, x: -2 * q2 * a, y: -2 * q2 * b, "1": q2 * (a * a + b * b) };
  if (verticale(e)) return { ...base, x2: q2 - n2, x: -2 * q2 * a + 2 * n2 * k, "1": q2 * (a * a + b * b) - n2 * k * k };
  return { ...base, y2: q2 - n2, y: -2 * q2 * b + 2 * n2 * k, "1": q2 * (a * a + b * b) - n2 * k * k };
}

/** Même calcul avec la directrice prise dans l'autre direction (piège « directrice horizontale »). */
export const polyAutreDirection = (e: Exercice135): Poly => poly135({ ...e, variante: verticale(e) ? "horizontale" : "verticale" });

/** Conique (paramètres réels) pour la figure du corrigé. */
export function conique135(e: Exercice135): Conique {
  const axe = verticale(e) ? "x" : "y";
  const coord = verticale(e) ? e.F.x : e.F.y;
  const s = Math.sign(coord - e.k) as 1 | -1;
  const D = Math.abs(coord - e.k);
  const ev = eVal(e);
  const autre = verticale(e) ? e.F.y : e.F.x;
  const place = (centreAxe: number) => (axe === "x" ? { h: centreAxe, k: autre } : { h: autre, k: centreAxe });
  if (e.nature === "parabole") return { nature: "parabole", ...place(coord - (s * D) / 2), axe, a2: 0, b2: 0, p: D, sens: s };
  if (e.nature === "ellipse") {
    const c = (D * ev * ev) / (1 - ev * ev);
    const a2 = (c * c) / (ev * ev);
    return { nature: "ellipse", ...place(coord + s * c), axe, a2, b2: a2 - c * c, p: 0, sens: 1 };
  }
  const c = (D * ev * ev) / (ev * ev - 1);
  const a2 = (c * c) / (ev * ev);
  return { nature: "hyperbole", ...place(coord - s * c), axe, a2, b2: c * c - a2, p: 0, sens: 1 };
}
