import { add, div, mul, neg, pgcdRat, rat, val, type Rat } from "./trigExact";
import { decalage, evaluer, periode, type SinusoideExacte } from "./sinusoideExacte";

/**
 * Modèle de 5gen53 « Associer formules et courbes » (5e, chapitre 2, §§ 4–5, processus 1 CONNAÎTRE).
 * Quatre expressions A sin(ωx + φ) + b (nommées f, g, h, p) et leurs quatre courbes, dans un ordre
 * mélangé (numérotées 1 à 4) ; un écran par courbe : « quelle expression ? » (choix fermé). Les
 * expressions d'une variante ne diffèrent que par le paramètre piège de la variante (φ / Φ, A < 0,
 * ω / T) — ou par un paramètre chacune (« mélange »).
 *
 * Même fenêtre et même quadrillage pour les quatre courbes (elles se comparent) : pas g = pgcd des
 * quarts de période et des décalages Φ (tout point clé sur une ligne), fenêtre [−W ; W], au plus
 * 16 colonnes.
 */

export type VarianteAssocierCourbes = "dephasage" | "amplitude" | "pulsation" | "melange";

export const NOMS = ["f", "g", "h", "p"] as const;

export interface ExerciceAssocierCourbes {
  variante: VarianteAssocierCourbes;
  /** Les quatre expressions, dans l'ordre f, g, h, p. */
  expressions: SinusoideExacte[];
  /** ordre[k] = indice de l'expression tracée comme courbe k + 1. */
  ordre: number[];
}

export interface FenetreCourbes {
  xMin: Rat;
  pas: Rat;
  colonnes: number;
  yMin: number;
  yMax: number;
}

export function fenetre(e: { variante: VarianteAssocierCourbes; expressions: SinusoideExacte[] }): FenetreCourbes {
  let pas: Rat | null = null;
  let W = rat(0);
  for (const s of e.expressions) {
    const T = periode(s);
    const q = div(T, rat(4));
    pas = pas ? pgcdRat(pas, q) : q;
    const P = decalage(s);
    if (P.n !== 0) pas = pgcdRat(pas, P);
    if (val(T) > val(W)) W = T;
  }
  if (e.variante === "pulsation" || e.variante === "melange") W = rat(2);
  const xMin = neg(W);
  const colonnes = Math.round((2 * val(W)) / val(pas!));
  const yMax = Math.max(0, ...e.expressions.map((s) => s.b + Math.abs(s.A))) + 1;
  const yMin = Math.min(0, ...e.expressions.map((s) => s.b - Math.abs(s.A))) - 1;
  return { xMin, pas: pas!, colonnes, yMin, yMax };
}

/** Deux courbes nettement différentes sur la fenêtre (écart maximal ≥ 0,5). */
export function courbesDistinctes(a: SinusoideExacte, b: SinusoideExacte, f: FenetreCourbes): boolean {
  const x0 = val(f.xMin) * Math.PI;
  const x1 = -x0;
  let ecart = 0;
  for (let k = 0; k <= 400; k++) {
    const x = x0 + ((x1 - x0) * k) / 400;
    ecart = Math.max(ecart, Math.abs(evaluer(a, x) - evaluer(b, x)));
  }
  return ecart >= 0.5;
}

/** Expression tracée comme courbe k (0 à 3). */
export function expressionDeCourbe(e: ExerciceAssocierCourbes, k: number): number {
  return e.ordre[k]!;
}

export function xColonne(f: FenetreCourbes, i: number): Rat {
  return add(f.xMin, mul(rat(i), f.pas));
}
