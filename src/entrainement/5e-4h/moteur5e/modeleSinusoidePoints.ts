import { add, div, egal, mul, rat, sub, val, type Rat } from "./trigExact";
import { decalage, periode, type SinusoideExacte } from "./sinusoideExacte";

/**
 * Modèle de 5gen52 « Construire une sinusoïde point par point » (5e, chapitre 2, § 4, processus 2
 * APPLIQUER) : la méthode de construction du cours (droite y = b, une période partagée en 4 à partir
 * de Φ, ordre b, max, b, min, b — inversé si A < 0 —, puis report par périodicité).
 *
 * Fenêtre de travail : [Φ − T/2 ; Φ + 3T/2] (deux périodes, 0 toujours dedans car Φ ∈ [−T/2 ; T/2[).
 * Quadrillage : pas g = T/4, ou T/8 quand Φ n'est pas un multiple de T/4 (φ multiple impair de π/4) —
 * chaque point clé tombe sur une intersection (abscisse multiple de g, ordonnée entière), et x = 0
 * aussi (g divise Φ). Points clés : x_j = Φ + j·T/4, j = −2…6 ; la période de l'écran 2 est j = 0…4,
 * les points à reporter (écran 3) sont j = −2, −1, 5, 6.
 */

export type VarianteSinusoidePoints = "positif" | "negatif" | "sansPi";

export interface ExerciceSinusoidePoints {
  variante: VarianteSinusoidePoints;
  A: number;
  /** Pulsation (rationnel ; multipliée par π si `enPi` est faux). */
  omega: Rat;
  /** Déphasage, coefficient de π, multiple de π/4 dans ]−π ; π] \ {0}. */
  phi: Rat;
  b: number;
  /** Abscisses en multiples de π (ω sans π). */
  enPi: boolean;
}

export function sinusoide(e: ExerciceSinusoidePoints): SinusoideExacte {
  return { A: e.A, omega: e.omega, phi: e.phi, b: e.b, enPi: e.enPi };
}

export function T(e: ExerciceSinusoidePoints): Rat {
  return periode(sinusoide(e));
}

export function Phi(e: ExerciceSinusoidePoints): Rat {
  return decalage(sinusoide(e));
}

export function quart(e: ExerciceSinusoidePoints): Rat {
  return div(T(e), rat(4));
}

export interface PointCle {
  j: number;
  x: Rat;
  y: number;
}

export function pointCle(e: ExerciceSinusoidePoints, j: number): PointCle {
  const motif = [0, 1, 0, -1][((j % 4) + 4) % 4]!;
  return { j, x: add(Phi(e), mul(rat(j), quart(e))), y: e.b + e.A * motif };
}

export const INDICES_PERIODE = [0, 1, 2, 3, 4];
export const INDICES_REPORT = [-2, -1, 5, 6];

export function pointsPeriode(e: ExerciceSinusoidePoints): PointCle[] {
  return INDICES_PERIODE.map((j) => pointCle(e, j));
}

export function pointsReport(e: ExerciceSinusoidePoints): PointCle[] {
  return INDICES_REPORT.map((j) => pointCle(e, j));
}

/** Pas du quadrillage horizontal. */
export function pasGrille(e: ExerciceSinusoidePoints): Rat {
  const q = quart(e);
  const k = div(Phi(e), q);
  return k.d === 1 ? q : div(q, rat(2));
}

export interface Cadre {
  xMin: Rat;
  pas: Rat;
  colonnes: number;
  yMin: number;
  yMax: number;
}

export function cadre(e: ExerciceSinusoidePoints): Cadre {
  const xMin = sub(Phi(e), div(T(e), rat(2)));
  const pas = pasGrille(e);
  const colonnes = Math.round(val(mul(rat(2), T(e))) / val(pas));
  const haut = Math.max(e.b + Math.abs(e.A), 0) + 1;
  const bas = Math.min(e.b - Math.abs(e.A), 0) - 1;
  return { xMin, pas, colonnes, yMin: bas, yMax: haut };
}

/** Abscisse de la colonne i. */
export function xColonne(c: Cadre, i: number): Rat {
  return add(c.xMin, mul(rat(i), c.pas));
}

/** Colonne d'une abscisse (entière par construction). */
export function colonneDe(c: Cadre, x: Rat): number {
  return Math.round(val(div(sub(x, c.xMin), c.pas)));
}

/** Point placé par l'élève : colonne et ordonnée entière. */
export interface PointPlace {
  i: number;
  y: number;
}

export function memePoint(c: Cadre, p: PointPlace, q: PointCle): boolean {
  return egal(xColonne(c, p.i), q.x) && p.y === q.y;
}
