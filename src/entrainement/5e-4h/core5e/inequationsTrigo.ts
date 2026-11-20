import type { Q } from "../ui5e/nombresTrigo";
import { q, qAdd, qDiv, qMul, qSub, qVal } from "../ui5e/nombresTrigo";

/**
 * Couche core — `5gen55` « Inéquations trigonométriques » (5e ch. 2, § 8 : méthode de l'inéquation
 * sinusoïdale, arc au cercle puis retour à x). Résoudre dans [0 ; 2π[ :
 * k·trig(ax + b) + d ◇ e, trig = sin ou cos, a ∈ {2 ; 3}, b multiple rationnel de π.
 * Tout est EXACT : m remarquable (0, ±1/2, ±√2/2, ±√3/2), angles en multiples rationnels de π.
 */

export type FonctionTrig = "sin" | "cos";
export type Symbole = "ge" | "gt" | "le" | "lt";
export type VarianteInequation = "directe" | "isoler";
export type CasInequation = "toujoursVraie" | "toujoursFausse";

/** Valeur exacte m = num·√rad (rad = 1, 2 ou 3). */
export interface ValeurExacte {
  num: Q;
  rad: 1 | 2 | 3;
}

export interface IntervalleX {
  g: Q;
  d: Q;
  /** Crochets : « [ » fermé à gauche / « ] » ouvert à gauche ; « ] » fermé à droite / « [ » ouvert à droite. */
  o: "[" | "]";
  f: "[" | "]";
}

export interface ExerciceInequationTrigo {
  variante: VarianteInequation;
  fonction: FonctionTrig;
  a: number;
  /** b = bPi·π. */
  bPi: Q;
  /** Coefficient et constante affichés : k·trig(u) + d ◇ e. */
  k: number;
  d: Q;
  e: ValeurExacte;
  symboleAffiche: Symbole;
  /** Après isolement : trig(u) ◇ m (le sens change si k < 0). */
  symbole: Symbole;
  m: ValeurExacte;
  inversion: boolean;
  cas: CasInequation | null;
  /** Arc canonique en u (multiples de π) : [ug ; ud] + 2kπ ; null pour un cas particulier. */
  arcU: [Q, Q] | null;
  /** Famille en x : [xg ; xd] + k·periode (multiples de π). */
  xg: Q | null;
  xd: Q | null;
  periode: Q;
  /** Solutions dans [0 ; 2π[, triées. */
  intervalles: IntervalleX[];
  /** Clé de répartition (collecteur, mesures). */
  cleCollecteur: string;
}

export const estStrict = (s: Symbole) => s === "gt" || s === "lt";
export const estSup = (s: Symbole) => s === "ge" || s === "gt";
export function inverser(s: Symbole): Symbole {
  return ({ ge: "le", gt: "lt", le: "ge", lt: "gt" } as const)[s];
}

export function valeurM(v: ValeurExacte): number {
  return qVal(v.num) * Math.sqrt(v.rad);
}

/** arcsin d'une valeur remarquable, en multiple de π (∈ [−1/2 ; 1/2]). */
export function arcsinPi(m: ValeurExacte): Q {
  const x = valeurM(m);
  const table: [number, Q][] = [
    [0, q(0)],
    [0.5, q(1, 6)],
    [Math.SQRT2 / 2, q(1, 4)],
    [Math.sqrt(3) / 2, q(1, 3)],
  ];
  for (const [v, a] of table) if (Math.abs(Math.abs(x) - v) < 1e-9) return x < 0 ? q(-a.n, a.d) : a;
  throw new Error("arcsinPi : valeur non remarquable");
}

/** Angle de [0 ; π] dont le cosinus vaut m (valeur remarquable), en multiple de π. */
export function arccosPi(m: ValeurExacte): Q {
  return qSub(q(1, 2), arcsinPi(m));
}

/** Arc canonique (cours, § 8) : sin ≥ m → [α ; π − α] ; sin ≤ m → [π − α ; 2π + α] ;
 * cos ≥ m → [−β ; β] ; cos ≤ m → [β ; 2π − β]. */
export function arcCanonique(f: FonctionTrig, s: Symbole, m: ValeurExacte): [Q, Q] {
  if (f === "sin") {
    const al = arcsinPi(m);
    return estSup(s) ? [al, qSub(q(1), al)] : [qSub(q(1), al), qAdd(q(2), al)];
  }
  const be = arccosPi(m);
  return estSup(s) ? [q(-be.n, be.d), be] : [be, qSub(q(2), be)];
}

/** Famille en x et solutions dans [0 ; 2π[ (`null` si un bord tombe sur 0 ou 2π de façon dégénérée). */
export function solutionsX(a: number, bPi: Q, arc: [Q, Q], strict: boolean): { xg: Q; xd: Q; periode: Q; intervalles: IntervalleX[] } | null {
  const xg = qDiv(qSub(arc[0], bPi), q(a));
  const xd = qDiv(qSub(arc[1], bPi), q(a));
  const periode = q(2, a);
  const out: IntervalleX[] = [];
  const ferme = !strict;
  for (let k = -3 * a - 2; k <= 3 * a + 2; k++) {
    const g = qAdd(xg, qMul(q(k), periode));
    const d = qAdd(xd, qMul(q(k), periode));
    const gv = qVal(g);
    const dv = qVal(d);
    if (dv <= 0 || gv >= 2) {
      // Borne droite fermée exactement en 0 : 0 serait une solution isolée — instance écartée.
      if (Math.abs(dv) < 1e-12 && ferme) return null;
      continue;
    }
    const iv: IntervalleX = { g, d, o: ferme ? "[" : "]", f: ferme ? "]" : "[" };
    if (gv < 0) {
      iv.g = q(0);
      iv.o = "[";
    }
    if (dv >= 2) {
      iv.d = q(2);
      iv.f = "[";
    }
    out.push(iv);
  }
  out.sort((x, y) => qVal(x.g) - qVal(y.g));
  return { xg, xd, periode, intervalles: out };
}
