import type { Conique, Nature } from "./coniquesLotH1";
import { poly, polyEntier } from "./coniquesLotH1";
import type { Poly } from "../ui6e/outilsLieuxLotH2";
import { choisir, entier } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen134` « Réduire par translation et donner tous les éléments » (6e ch. 10,
 * § 2, Appliquer ; prolonge 6gen58 B). Équation développée Ax² + By² + Dx + Ey + F = 0 (coefficients
 * entiers premiers entre eux, x² positif quand il est présent : pour une hyperbole d'axe focal vertical,
 * le second membre devient NÉGATIF après la complétion — le piège du cours). Six écrans pour chaque
 * nature :
 * - centre Ω (ou sommet S), équation réduite dans le repère translaté (x′, y′), nature et axe focal
 *   (choix fermé à six options), puis
 * - ellipse : sommets, foyers, directrices ; hyperbole : sommets, foyers, asymptotes ;
 *   parabole : paramètre p (piège p contre 2p), foyer, directrice — tous dans le repère INITIAL.
 * La nature est tirée au tiers AVANT les nombres ; les variantes « ellipse / hyperbole / parabole » du
 * sélecteur forment un groupe à verdict dans le panneau d'évaluation.
 */

export type Variante134 = Nature;
export type Phase134 = "centre" | "reduite" | "nature" | "sommets" | "foyers" | "directrices" | "asymptotes" | "parametre" | "foyer" | "directrice";

export interface Exercice134 {
  variante: Variante134;
  C: Conique;
  /** Facteur commun de l'équation développée de la parabole (1 à 3). */
  m: number;
}

export function phases134(e: Exercice134): Phase134[] {
  if (e.C.nature === "ellipse") return ["centre", "reduite", "nature", "sommets", "foyers", "directrices"];
  if (e.C.nature === "hyperbole") return ["centre", "reduite", "nature", "sommets", "foyers", "asymptotes"];
  return ["centre", "reduite", "nature", "parametre", "foyer", "directrice"];
}

/** Ellipses à c entier (a peut être irrationnel : a² = 8, 12, 13, 18, 20). */
const ELLIPSES: [number, number][] = [
  [8, 4],
  [9, 5],
  [12, 8],
  [13, 9],
  [20, 16],
  [13, 4],
  [25, 16],
  [18, 9],
  [25, 9],
  [20, 4],
];

function tirerConique(nature: Nature): Conique {
  const axe = Math.random() < 0.5 ? "x" : "y";
  let h = 0;
  let k = 0;
  while (h === 0 || k === 0) {
    h = entier(-4, 4);
    k = entier(-4, 4);
  }
  if (nature === "ellipse") {
    const [a2, b2] = choisir(ELLIPSES);
    return { nature, h, k, axe, a2, b2, p: 0, sens: 1 };
  }
  if (nature === "hyperbole") {
    const a = entier(1, 4);
    const b = entier(1, 4);
    return { nature, h, k, axe, a2: a * a, b2: b * b, p: 0, sens: 1 };
  }
  return { nature, h, k, axe, a2: 0, b2: 0, p: entier(1, 5), sens: Math.random() < 0.5 ? 1 : -1 };
}

export function tirer134(nature: Nature): Exercice134 {
  const C = tirerConique(nature);
  return { variante: nature, C, m: nature === "parabole" ? choisir([1, 1, 2, 3]) : 1 };
}

/** Équation développée donnée (x² ou, à défaut, y² de coefficient positif). */
export function polyDonne(e: Exercice134): Poly {
  const p = polyEntier(poly(e.C));
  const signe = (p.x2 ?? 0) < 0 || ((p.x2 ?? 0) === 0 && (p.y2 ?? 0) < 0) ? -1 : 1;
  const q = polyEntier(p, signe);
  if (e.m === 1) return q;
  const r: Poly = {};
  for (const [mono, v] of Object.entries(q) as [keyof Poly, number][]) r[mono] = v * e.m;
  return r;
}
