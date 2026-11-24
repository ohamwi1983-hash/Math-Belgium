/**
 * Couche core — `5gen75` « Dérivable ou non en a ? » (5e ch. 5, § 3 dom_d f et § 4 point anguleux,
 * tangente verticale, dérivable ⟹ continue ; processus 2 APPLIQUER). VERSION MODESTE (décision de
 * l'utilisateur, 24/11/2026) : fonctions simples seulement —
 * - `morceaux*` : deux morceaux polynomiaux de degré ≤ 2 raccordés en a (f(x) = P₁(x) si x ≤ a,
 *   P₂(x) si x > a) ; verdict dérivable / point anguleux / pas continue ;
 * - `absolue` : f(x) = c|x − a| + q(x), q de degré ≤ 2 : point anguleux (pentes q′(a) ∓ c) ;
 * - `racine` : f(x) = c√(x − a) + b sur [a ; +∞[ : tangente verticale en a (comme √x en 0).
 * Pas de x|x|·g, pas de racine cubique (version plus poussée réservée à la 5e 6h).
 * Les deux côtés sont écrits dans la base u = x − a : P(x) = α u² + β u + γ, donc f(a) = γ₁,
 * limites γ₁ et γ₂, taux à gauche α₁h + β₁, taux à droite α₂h + β₂ + (γ₂ − γ₁)/h.
 */

export type VarianteDerivabilite = "morceauxDerivable" | "morceauxAnguleux" | "morceauxDiscontinu" | "absolue" | "racine";
export type VerdictDerivabilite = "derivable" | "anguleux" | "verticale" | "discontinue";

/** Polynôme de degré ≤ 2 dans la base u = x − a : [α, β, γ]. */
export type PolyU = [number, number, number];

export interface ExerciceDerivabilite {
  variante: VarianteDerivabilite;
  a: number;
  /** Morceaux (et forme développée de c|x − a| + q de part et d'autre de a). */
  gauche: PolyU;
  droite: PolyU;
  /** absolue : c et q(x) = q₀x² + q₁x + q₂ ; racine : f(x) = c√(x − a) + b. */
  c: number;
  q: [number, number, number];
  b: number;
}

type E = ExerciceDerivabilite;

export function verdict(e: E): VerdictDerivabilite {
  if (e.variante === "racine") return "verticale";
  if (e.variante === "absolue" || e.variante === "morceauxAnguleux") return "anguleux";
  if (e.variante === "morceauxDiscontinu") return "discontinue";
  return "derivable";
}

export const unilaterale = (e: E): boolean => e.variante === "racine";

const val = (p: PolyU, u: number): number => p[0] * u * u + p[1] * u + p[2];

/** Coefficients en x (plus haut degré d'abord) d'un PolyU : αx² + (β − 2αa)x + (αa² − βa + γ). */
export function enX(p: PolyU, a: number): [number, number, number] {
  return [p[0], p[1] - 2 * p[0] * a, p[0] * a * a - p[1] * a + p[2]].map((v) => (Object.is(v, -0) ? 0 : v)) as [number, number, number];
}

export function f(e: E, x: number): number {
  if (e.variante === "racine") return x < e.a ? NaN : e.c * Math.sqrt(x - e.a) + e.b;
  return x <= e.a ? val(e.gauche, x - e.a) : val(e.droite, x - e.a);
}

export const fa = (e: E): number => (e.variante === "racine" ? e.b : e.gauche[2]);
export const limGauche = (e: E): number => e.gauche[2];
export const limDroite = (e: E): number => (e.variante === "racine" ? e.b : e.droite[2]);

/** Taux d'accroissement (f(a + h) − f(a))/h. */
export function taux(e: E, h: number): number {
  return (f(e, e.a + h) - fa(e)) / h;
}

export const limTauxGauche = (e: E): number => e.gauche[1];
export function limTauxDroite(e: E): number {
  if (e.variante === "racine") return e.c > 0 ? Infinity : -Infinity;
  const saut = e.droite[2] - e.gauche[2];
  if (saut !== 0) return saut > 0 ? Infinity : -Infinity;
  return e.droite[1];
}

/** Nombre dérivé (verdict dérivable). */
export const deriveeEnA = (e: E): number => e.gauche[1];

export const POINTS_GAUCHE = [-0.83, -0.47, -0.29, -0.13, -0.06];
export const POINTS_DROITE = [0.06, 0.13, 0.29, 0.47, 0.83];
