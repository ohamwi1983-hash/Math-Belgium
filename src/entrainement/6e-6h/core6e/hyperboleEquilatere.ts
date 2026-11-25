import type { Conique, PEx } from "./coniquesLotH1";
import { ex, racineEx } from "./coniquesLotH1";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { choisir } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen137` « Hyperbole équilatère et xy = k » (6e ch. 10, § 1, Appliquer). Passer
 * d'une forme à l'autre (cours, § 1 : en prenant les asymptotes comme axes, x² − y² = a² devient
 * XY = k avec k = a²/2 — piège : k = a²) :
 * - `versXY` : x² − y² = a² donnée → c (= a√2), k, sommets dans le repère des asymptotes
 *   (a√2/2 ; a√2/2) et l'opposé ;
 * - `versX2Y2` : xy = k donnée (k > 0) → a² de X² − Y² = a² dans le repère des axes de symétrie (= 2k),
 *   sommets (√k ; √k) et (−√k ; −√k), foyers (√(2k) ; √(2k)) et l'opposé, dans le repère donné.
 * Les valeurs sont choisies pour que tout s'écrive avec au plus une racine simple.
 */

export type Variante137 = "versXY" | "versX2Y2";
export type Phase137 = "c" | "k" | "sommetsXY" | "a2" | "sommets" | "foyers";

export interface Exercice137 {
  variante: Variante137;
  /** versXY : a² ; versX2Y2 : k. */
  a2: number;
  k: number;
}

export function phases137(e: Exercice137): Phase137[] {
  return e.variante === "versXY" ? ["c", "k", "sommetsXY"] : ["a2", "sommets", "foyers"];
}

export function tirer137(variante: Variante137): Exercice137 {
  if (variante === "versXY") {
    const a2 = choisir([2, 4, 8, 9, 16, 18, 25, 32, 36, 50]);
    return { variante, a2, k: a2 / 2 };
  }
  const k = choisir([1, 2, 4, 8, 9, 18]);
  return { variante, a2: 2 * k, k };
}

export const c137 = (e: Exercice137) => racineEx(2 * e.a2);
/** Sommets dans le repère des asymptotes : (a/√2 ; a/√2) et l'opposé. */
export function sommetsXY137(e: Exercice137): PEx[] {
  const s = racineEx(e.a2 / 2);
  return [
    { x: s, y: s },
    { x: ex(-s.q, -s.r, s.n), y: ex(-s.q, -s.r, s.n) },
  ];
}
/** xy = k : sommets (√k ; √k), foyers (√(2k) ; √(2k)) et leurs opposés. */
export function sommets137(e: Exercice137): PEx[] {
  const s = racineEx(e.k);
  return [
    { x: s, y: s },
    { x: ex(-s.q, -s.r, s.n), y: ex(-s.q, -s.r, s.n) },
  ];
}
export function foyers137(e: Exercice137): PEx[] {
  const s = racineEx(2 * e.k);
  return [
    { x: s, y: s },
    { x: ex(-s.q, -s.r, s.n), y: ex(-s.q, -s.r, s.n) },
  ];
}

/** Hyperbole x² − y² = a² (pour la figure). */
export const conique137 = (e: Exercice137): Conique => ({ nature: "hyperbole", h: 0, k: 0, axe: "x", a2: e.a2, b2: e.a2, p: 0, sens: 1 });

/** Points de la branche xy = k (pour la figure du repère donné de `versX2Y2`). */
export function branchesXY(k: number, borne: number): P[][] {
  const n = 120;
  const branche = (s: number) =>
    [...Array(n + 1).keys()].map((i) => {
      const x = s * (k / borne + ((borne - k / borne) * i) / n);
      return { x, y: k / x };
    });
  return [branche(1), branche(-1)];
}
