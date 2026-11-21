import type { Cible, Exacte } from "../ui5e/ecrituresLimitesLotG";
import { exacte, extraire, MOINS, PLUS, pointC } from "../ui5e/ecrituresLimitesLotG";

/**
 * Couche core — `5gen64` « Limites avec racines carrées : expression conjuguée » (5e ch. 4, § 1,
 * processus 2 APPLIQUER). Quatre écrans : la forme (choix fermé ∞ − ∞, 0/0, ∞/∞ ou « pas
 * indéterminée »), la transformation (expression conjuguée + produit remarquable écrit, ou x² mis en
 * évidence sous la racine en −∞), les deux limites partielles après simplification, la conclusion
 * (valeur exacte).
 *
 * VARIANTE = famille d'expression ; sous-forme tirée dans la variante :
 * - diffPlus « A » : √(p²x² + bx + c) − px en +∞ → b/(2p) ;
 * - deuxRacines « B1 » : √(x + a) − √(x + b) en +∞ → 0 ; « B2 » : √(x² + ax + c) − √(x² + bx + d)
 *   en +∞ → (a − b)/2 ;
 * - zeroEnZero « C » : (√(kx + c) − √c)/x en 0 → k/(2√c) (c carré parfait 70 %) ;
 * - zeroEnA « D » : (√(x + p) − n)/(m(x − a)) en a = n² − p → 1/(2mn) ;
 * - moinsInfini « E1 » : √(m²x² + bx + c)/(px + q) en −∞ → −m/p (√(x²) = |x| = −x : LE piège) ;
 *   « E2 » : √(p²x² + bx + c) + px en −∞ → −b/(2p).
 * Le nom de la variante ne dit pas de verdict : la forme se lit sur l'expression elle-même.
 */

export type VarianteConjuguee = "diffPlus" | "deuxRacines" | "zeroEnZero" | "zeroEnA" | "moinsInfini";
export type SousFormeConjuguee = "A" | "B1" | "B2" | "C" | "D" | "E1" | "E2";
export type FormeIndeterminee = "infMoinsInf" | "zeroSurZero" | "infSurInf";

export interface ExerciceConjuguee {
  variante: VarianteConjuguee;
  sous: SousFormeConjuguee;
  /** Paramètres entiers de la sous-forme. */
  d: Record<string, number>;
}

export function cible(e: ExerciceConjuguee): Cible {
  switch (e.sous) {
    case "A":
    case "B1":
    case "B2":
      return PLUS;
    case "C":
      return pointC(0);
    case "D":
      return pointC(e.d.n * e.d.n - e.d.p);
    default:
      return MOINS;
  }
}

/** Valeur numérique visée (point, ou ±∞). */
export function cibleV(e: ExerciceConjuguee): number {
  const c = cible(e);
  return c.type === "plus" ? Infinity : c.type === "moins" ? -Infinity : c.a;
}

export function forme(e: ExerciceConjuguee): FormeIndeterminee {
  if (e.sous === "C" || e.sous === "D") return "zeroSurZero";
  if (e.sous === "E1") return "infSurInf";
  return "infMoinsInf";
}

/** La fonction (NaN hors du domaine). */
export function fonction(e: ExerciceConjuguee): (x: number) => number {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return (x) => Math.sqrt(d.p * d.p * x * x + d.b * x + d.c) - d.p * x;
    case "B1":
      return (x) => Math.sqrt(x + d.a) - Math.sqrt(x + d.b);
    case "B2":
      return (x) => Math.sqrt(x * x + d.a * x + d.c) - Math.sqrt(x * x + d.b * x + d.d);
    case "C":
      return (x) => (Math.sqrt(d.k * x + d.c) - Math.sqrt(d.c)) / x;
    case "D":
      return (x) => (Math.sqrt(x + d.p) - d.n) / (d.m * (x - (d.n * d.n - d.p)));
    case "E1":
      return (x) => Math.sqrt(d.m * d.m * x * x + d.b * x + d.c) / (d.p * x + d.q);
    case "E2":
      return (x) => Math.sqrt(d.p * d.p * x * x + d.b * x + d.c) + d.p * x;
  }
}

/** Le radicande c est-il un carré parfait (sous-forme C) ? */
export const carreParfait = (c: number): boolean => Number.isInteger(Math.sqrt(c));

/** Limite exacte. */
export function limite(e: ExerciceConjuguee): Exacte {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return exacte(d.b, 2 * d.p);
    case "B1":
      return exacte(0);
    case "B2":
      return exacte(d.a - d.b, 2);
    case "C": {
      const { c: k, r } = extraire(d.c);
      // k_x / (2·k√r) = k_x·√r / (2·k·r)
      return r === 1 ? exacte(d.k, 2 * k) : exacte(d.k, 2 * k * r, r);
    }
    case "D":
      return exacte(1, 2 * d.m * d.n);
    case "E1":
      return exacte(-d.m, d.p);
    case "E2":
      return exacte(-d.b, 2 * d.p);
  }
}

/** Polynôme (coefficients, degré décroissant) obtenu par le produit remarquable, ou null (E1). */
export function produit(e: ExerciceConjuguee): number[] | null {
  const d = e.d;
  switch (e.sous) {
    case "A":
    case "E2":
      return [d.b, d.c];
    case "B1":
      return [d.a - d.b];
    case "B2":
      return [d.a - d.b, d.c - d.d];
    case "C":
      return [d.k, 0];
    case "D":
      return [1, d.p - d.n * d.n];
    case "E1":
      return null;
  }
}

/** Expression conjuguée (fonction), ou null (E1). */
export function conjuguee(e: ExerciceConjuguee): ((x: number) => number) | null {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return (x) => Math.sqrt(d.p * d.p * x * x + d.b * x + d.c) + d.p * x;
    case "E2":
      return (x) => Math.sqrt(d.p * d.p * x * x + d.b * x + d.c) - d.p * x;
    case "B1":
      return (x) => Math.sqrt(x + d.a) + Math.sqrt(x + d.b);
    case "B2":
      return (x) => Math.sqrt(x * x + d.a * x + d.c) + Math.sqrt(x * x + d.b * x + d.d);
    case "C":
      return (x) => Math.sqrt(d.k * x + d.c) + Math.sqrt(d.c);
    case "D":
      return (x) => Math.sqrt(x + d.p) + d.n;
    case "E1":
      return null;
  }
}

/** Expression de départ « A − B » (le terme qu'on multiplie par sa conjuguée), en fonction. */
export function expressionAB(e: ExerciceConjuguee): ((x: number) => number) | null {
  const d = e.d;
  switch (e.sous) {
    case "C":
      return (x) => Math.sqrt(d.k * x + d.c) - Math.sqrt(d.c);
    case "D":
      return (x) => Math.sqrt(x + d.p) - d.n;
    case "E1":
      return null;
    default:
      return fonction(e);
  }
}

/** Limites partielles (numérateur, dénominateur) après simplification / division par x. */
export function partielles(e: ExerciceConjuguee): [number, number] {
  const d = e.d;
  switch (e.sous) {
    case "A":
      return [d.b, 2 * d.p];
    case "B1":
      return [d.a - d.b, Infinity];
    case "B2":
      return [d.a - d.b, 2];
    case "C":
      return [d.k, 2 * Math.sqrt(d.c)];
    case "D":
      return [1, 2 * d.m * d.n];
    case "E1":
      return [-d.m, d.p];
    case "E2":
      return [d.b, -2 * d.p];
  }
}

/** Points de contrôle (dans le domaine) pour comparer deux expressions en x. */
export function pointsControle(e: ExerciceConjuguee): number[] {
  switch (e.sous) {
    case "A":
    case "B1":
    case "B2":
      return [12.3, 17.9, 31.7, 58.1, 97.3];
    case "E1":
    case "E2":
      return [-12.3, -17.9, -31.7, -58.1, -97.3];
    case "C":
      return [-0.31, -0.17, 0.07, 0.19, 0.29];
    case "D": {
      const a = e.d.n * e.d.n - e.d.p;
      return [a - 0.31, a - 0.17, a + 0.07, a + 0.19, a + 0.29];
    }
  }
}
