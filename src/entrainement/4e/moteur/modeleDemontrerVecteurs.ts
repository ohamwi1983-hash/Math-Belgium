import type { Coefficients, ExerciceDemontrerVecteurs, FigureBase, OptionBase, Rationnel, TypeConclusion, VecteurNomme } from "../core/demontrerVecteurs.types";

/**
 * Modèle de gen85 : arithmétique rationnelle EXACTE (propre à ce générateur), positions des points
 * dans la base adaptée, coefficients des vecteurs utiles et coefficient de colinéarité. Une seule
 * source pour l'écran, les aides, la vérification et l'adaptateur de feuilles.
 */

// ---------------------------------------------------------------------------------------------
// Rationnels
// ---------------------------------------------------------------------------------------------

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function q(n: number, d = 1): Rationnel {
  if (d === 0) throw new Error("rationnel : dénominateur nul");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  const num = n / g;
  return { n: num === 0 ? 0 : num, d: d / g };
}

export const ZERO = q(0);
export const UN = q(1);

export function plus(a: Rationnel, b: Rationnel): Rationnel {
  return q(a.n * b.d + b.n * a.d, a.d * b.d);
}
export function moins(a: Rationnel, b: Rationnel): Rationnel {
  return q(a.n * b.d - b.n * a.d, a.d * b.d);
}
export function fois(a: Rationnel, b: Rationnel): Rationnel {
  return q(a.n * b.n, a.d * b.d);
}
export function divise(a: Rationnel, b: Rationnel): Rationnel {
  return q(a.n * b.d, a.d * b.n);
}
export function oppose(a: Rationnel): Rationnel {
  return q(-a.n, a.d);
}
export function egaux(a: Rationnel, b: Rationnel): boolean {
  return a.n === b.n && a.d === b.d;
}
export function estNul(a: Rationnel): boolean {
  return a.n === 0;
}
export function valeur(a: Rationnel): number {
  return a.n / a.d;
}

// ---------------------------------------------------------------------------------------------
// Coefficients (points depuis A, vecteurs)
// ---------------------------------------------------------------------------------------------

export function c(x: Rationnel, y: Rationnel): Coefficients {
  return { x, y };
}
export function cPlus(a: Coefficients, b: Coefficients): Coefficients {
  return c(plus(a.x, b.x), plus(a.y, b.y));
}
export function cMoins(a: Coefficients, b: Coefficients): Coefficients {
  return c(moins(a.x, b.x), moins(a.y, b.y));
}
export function cFois(k: Rationnel, a: Coefficients): Coefficients {
  return c(fois(k, a.x), fois(k, a.y));
}
export function cEgaux(a: Coefficients, b: Coefficients): boolean {
  return egaux(a.x, b.x) && egaux(a.y, b.y);
}
/** Déterminant (produit en croix) : nul ⟺ colinéaires. */
export function det(a: Coefficients, b: Coefficients): Rationnel {
  return moins(fois(a.x, b.y), fois(a.y, b.x));
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

/** Sommets de la figure de base, dans l'ordre. */
export function sommets(figure: FigureBase): string[] {
  return figure === "triangle" ? ["A", "B", "C"] : ["A", "B", "C", "D"];
}

/** Second vecteur de la base adaptée : AD (parallélogramme, trapèze) ou AC (triangle). */
export function secondVecteurBase(figure: FigureBase): VecteurNomme {
  return figure === "triangle" ? { de: "A", vers: "C" } : { de: "A", vers: "D" };
}

export const PREMIER_VECTEUR_BASE: VecteurNomme = { de: "A", vers: "B" };

export function baseAdaptee(figure: FigureBase): OptionBase {
  return { id: "adaptee", u: PREMIER_VECTEUR_BASE, v: secondVecteurBase(figure) };
}

/** Positions des sommets dans la base adaptée. */
export function positionsSommets(figure: FigureBase, t: Rationnel | null): Record<string, Coefficients> {
  const A = c(ZERO, ZERO);
  const B = c(UN, ZERO);
  if (figure === "triangle") return { A, B, C: c(ZERO, UN) };
  if (figure === "parallelogramme") return { A, B, C: c(UN, UN), D: c(ZERO, UN) };
  return { A, B, C: c(t ?? q(1, 2), UN), D: c(ZERO, UN) };
}

/** Positions de tous les points (sommets puis E, F). */
export function positions(e: Pick<ExerciceDemontrerVecteurs, "figure" | "t" | "definis">): Record<string, Coefficients> {
  const p = { ...positionsSommets(e.figure, e.t) };
  for (const d of e.definis) {
    p[d.nom] = cPlus(p[d.origine]!, cFois(d.k, cMoins(p[d.vers]!, p[d.de]!)));
  }
  return p;
}

export function coefficientsVecteur(e: Pick<ExerciceDemontrerVecteurs, "figure" | "t" | "definis">, vec: VecteurNomme): Coefficients {
  const p = positions(e);
  return cMoins(p[vec.vers]!, p[vec.de]!);
}

/** Coefficient k tel que v = k·w (existe par construction). */
export function coefficientColinearite(e: ExerciceDemontrerVecteurs): Rationnel {
  const w = coefficientsVecteur(e, e.w);
  const v = coefficientsVecteur(e, e.v);
  return estNul(w.x) ? divise(v.y, w.y) : divise(v.x, w.x);
}

export function typeConclusion(e: ExerciceDemontrerVecteurs): TypeConclusion {
  return e.cible.type;
}

/** Vecteurs dont les deux points définis interviennent : utile pour savoir si une base est colinéaire. */
export function colineaires(e: Pick<ExerciceDemontrerVecteurs, "figure" | "t" | "definis">, a: VecteurNomme, b: VecteurNomme): boolean {
  return estNul(det(coefficientsVecteur(e, a), coefficientsVecteur(e, b)));
}

// ---------------------------------------------------------------------------------------------
// Dessin (figure à l'écran et sur papier, séparation des points au tirage)
// ---------------------------------------------------------------------------------------------

/** Vecteurs de dessin (unités de figure, y vers le haut) : la figure n'est jamais un rectangle. */
export const VECTEURS_DESSIN: Record<FigureBase, { u: [number, number]; v: [number, number] }> = {
  parallelogramme: { u: [4, 0], v: [1.5, 2.6] },
  triangle: { u: [4.2, 0], v: [1.4, 3] },
  trapeze: { u: [4.6, 0], v: [0.8, 2.6] },
};

export function pointDessin(figure: FigureBase, p: Coefficients): [number, number] {
  const { u, v } = VECTEURS_DESSIN[figure];
  const x = valeur(p.x);
  const y = valeur(p.y);
  return [x * u[0] + y * v[0], x * u[1] + y * v[1]];
}
