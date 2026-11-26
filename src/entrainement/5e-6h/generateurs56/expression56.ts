import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { evaluerExpressionGenerale } from "../../5e-4h/moteur/expressionGenerale";

/**
 * Lecture d'une expression en une variable entière (i, j ou n) pour les générateurs 56gen21 et 56gen22 :
 * évaluateur commun du 5e (`evaluerExpressionGenerale` : « − – — », virgule, multiplication implicite
 * « 3i », « 2(n + 1) », puissances « 2^i », « ² », √, |…|). La saisie est comparée à la cible en
 * plusieurs valeurs de la variable (toute forme équivalente est acceptée). Une erreur de SYNTAXE (ou une
 * autre lettre) → `parse_error` : aucune tentative consommée.
 */

/** Valeurs de l'expression aux points donnés ; `null` si elle est illisible. */
export function valeursExpression(brut: string, variable: string, points: number[]): number[] | null {
  const s = (brut ?? "").trim();
  if (s === "") return null;
  try {
    return points.map((p) => evaluerExpressionGenerale(s, Number.NaN, { [variable]: p }));
  } catch {
    return null;
  }
}

/** Égalité à une tolérance relative (grands entiers compris). */
export function egaux(x: number, y: number): boolean {
  return Number.isFinite(x) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
}

export function statutExpression(brut: string, variable: string, points: number[], cible: (p: number) => number): StatutVerification {
  const v = valeursExpression(brut, variable, points);
  if (v === null) return "parse_error";
  return v.every((x, i) => egaux(x, cible(points[i]))) ? "correct" : "not_equivalent";
}

/** L'expression vaut-elle `cible` en tous les points ? (`false` si illisible) */
export function expressionEgale(brut: string, variable: string, points: number[], cible: (p: number) => number): boolean {
  return statutExpression(brut, variable, points, cible) === "correct";
}
