import type { Composantes } from "../core/vecteur.types";
import type { ExerciceViserCible, SituationViserCible, VerdictDirect, VerdictInverse } from "../core/viserCible.types";

/**
 * Modèle de gen89 : UNE seule source pour l'écran, les aides, la vérification, la figure et
 * l'adaptateur de feuilles. Critère de colinéarité du cours (le même que gen24) :
 * u⃗ et v⃗ colinéaires ⟺ x_u·y_v − y_u·x_v = 0 ; puis le SENS, par le signe de k (AC⃗ = k·u⃗).
 */

/** Cadre de la scène (table, pièce, terrain, piste), en unités du repère. */
export interface Cadre {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const CADRES: Record<SituationViserCible, Cadre> = {
  billard: { xMin: 0, xMax: 16, yMin: 0, yMax: 8 },
  laser: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 },
  foot: { xMin: 0, xMax: 18, yMin: 0, yMax: 12 },
  curling: { xMin: 0, xMax: 18, yMin: 0, yMax: 6 },
};

/** Fraction réduite, dénominateur > 0. */
export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function fraction(num: number, den: number): Fraction {
  const g = pgcd(num, den);
  const signe = den < 0 ? -1 : 1;
  const n = (signe * num) / g;
  return { num: n === 0 ? 0 : n, den: (signe * den) / g };
}

export function valeurFraction(f: Fraction): number {
  return f.num / f.den;
}

export function vecteurAC(e: ExerciceViserCible): Composantes {
  return { x: e.C.x - e.A.x, y: e.C.y - e.A.y };
}

/** Critère du cours, dans l'ordre (u⃗, AC⃗) : x_u·y_AC − y_u·x_AC. (L'ordre inverse donne l'opposé,
 * accepté par la vérification, comme dans gen24.) Sens inverse : calculé avec la SOLUTION m. */
export function critere(e: ExerciceViserCible): number {
  const ac = vecteurAC(e);
  const c = e.u.x * ac.y - e.u.y * ac.x;
  return c === 0 ? 0 : c;
}

export function colineaires(e: ExerciceViserCible): boolean {
  return critere(e) === 0;
}

/** k tel que AC⃗ = k·u⃗ (u⃗ n'a jamais de composante nulle) ; `null` si non colinéaires. */
export function coefficientK(e: ExerciceViserCible): Fraction | null {
  if (!colineaires(e)) return null;
  const ac = vecteurAC(e);
  return fraction(ac.x, e.u.x);
}

export function verdictDirect(e: ExerciceViserCible): VerdictDirect {
  const k = coefficientK(e);
  if (!k) return "cote";
  return k.num > 0 ? "touche" : "derriere";
}

export function verdictInverse(e: ExerciceViserCible): VerdictInverse {
  const k = coefficientK(e);
  return k && k.num > 0 ? "possible" : "impossible";
}

/** Composante connue de u⃗ en sens inverse. */
export function composanteConnue(e: ExerciceViserCible): number {
  return e.inconnue === "x" ? e.u.y : e.u.x;
}

/** Solution m du sens inverse. */
export function solutionM(e: ExerciceViserCible): number {
  return e.inconnue === "x" ? e.u.x : e.u.y;
}

/**
 * Condition de colinéarité du sens inverse, sous la forme α·m + β = 0, avec le critère écrit dans
 * l'ordre du cours (u⃗, AC⃗) : u⃗(m ; c) → m·y_AC − c·x_AC ; u⃗(c ; m) → c·y_AC − m·x_AC.
 */
export function conditionInverse(e: ExerciceViserCible): { alpha: number; beta: number } {
  const ac = vecteurAC(e);
  const c = composanteConnue(e);
  return e.inconnue === "x" ? { alpha: ac.y, beta: -c * ac.x } : { alpha: -ac.x, beta: c * ac.y };
}

/** Distance de C à la droite (A ; u⃗) — sert au corrigé (« à côté, de très près »). */
export function distanceCibleDroite(e: ExerciceViserCible): number {
  return Math.abs(critere(e)) / Math.hypot(e.u.x, e.u.y);
}
