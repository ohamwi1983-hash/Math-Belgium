import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Lecture des saisies des générateurs 6gen148–6gen151 (6e ch. 2, lot G de l'audit) — jamais de
 * blocage de frappe : la saisie est lue telle quelle, `null` = illisible (l'écran le dit, AUCUNE
 * tentative consommée). Évaluateur commun du chapitre (`expressionExponentielle.ts` : virgule ou
 * point, « − », fractions, puissances, `ln`, `e`, `exp`, `√`, multiplication implicite).
 *
 * - Espaces des milliers (« 1 000 », « 10 512,67 ») retirés avant la lecture.
 * - Unité finale ignorée (« °C », « € », « % », « min », « ans », « semaines », « milliers »).
 * - Préfixe « k = », « a = », « f(0) = », « T(12) = »… toléré (`prefixe`).
 */

const UNITES_FINALES = /\s*(°\s*c|€|eur(os?)?|%|min(utes?)?|semaines?|ans?|années?|milliers?|jours?)\s*$/i;

function preparer(brut: string): string {
  return normaliserSigneMoins(brut)
    .trim()
    .replace(UNITES_FINALES, "")
    .replace(/(\d)[    ](?=\d{3}(?!\d))/g, "$1")
    .trim();
}

/** Retire un préfixe « nom = » (nom d'une lettre, ou « f(…) », « T(…) ») avant la valeur. */
function sansPrefixe(s: string): string {
  return s.replace(/^\s*([a-zA-Zα-ωΔ]{1,3}(_?\w+)?\s*(\([^()]*\))?|f'\s*\([^()]*\))\s*=\s*/, "");
}

/** Valeur numérique d'une saisie, ou `null` si elle est illisible (ou non finie). */
export function lireValeur(brut: string): number | null {
  const s = sansPrefixe(preparer(brut));
  if (s === "" || s.includes("=")) return null;
  try {
    const v = evaluerExpressionExponentielle(s, {});
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function statutProche(brut: string, attendu: number, tolerance: number): StatutVerification {
  const v = lireValeur(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu) <= tolerance ? "correct" : "not_equivalent";
}

export function valeurProche(brut: string, cible: number, tolerance: number): boolean {
  const v = lireValeur(brut);
  return v !== null && Math.abs(v - cible) <= tolerance;
}

/** Évalue une expression en x (`null` : illisible). Préfixe « f(x) = » ou « y = » toléré. */
export function evaluerExpressionX(brut: string, x: number): number | null | "illisible" {
  const s = preparer(brut).replace(/^\s*(f\s*\(\s*x\s*\)|y)\s*=\s*/i, "");
  if (s === "" || s.includes("=")) return "illisible";
  try {
    const v = evaluerExpressionExponentielle(s, { x });
    return Number.isFinite(v) ? v : null;
  } catch {
    return "illisible";
  }
}

/** Saisie d'une expression de x : `correct` si elle vaut `attendue(x)` en tous les points testés. */
export function statutExpression(brut: string, attendue: (x: number) => number, points: number[], tolRel = 1e-6): StatutVerification {
  for (const x of points) {
    const v = evaluerExpressionX(brut, x);
    if (v === "illisible") return "parse_error";
    const a = attendue(x);
    if (v === null || Math.abs(v - a) > tolRel * Math.max(1, Math.abs(a))) return "not_equivalent";
  }
  return "correct";
}

/** Une expression de x vaut-elle `cible(x)` aux points testés ? (message ciblé) */
export function expressionVaut(brut: string, cible: (x: number) => number, points: number[]): boolean {
  return statutExpression(brut, cible, points) === "correct";
}

/**
 * Droite saisie comme une équation en x et y, sous n'importe quelle forme (« y = 3x − 2 »,
 * « y − 8 = 8ln2(x − 3) », « 3x − y = 2 ») : pente m et ordonnée à l'origine p, ou `illisible`, ou
 * `pas-une-droite` (pas une droite non verticale). Sans « = », la saisie est lue comme « y = … ».
 */
export function lireDroite(brut: string): { m: number; p: number } | "illisible" | "pas-une-droite" {
  const s = normaliserSigneMoins(brut).trim().replace(/(\d)[   ](?=\d{3}(?!\d))/g, "$1");
  if (s === "") return "illisible";
  const morceaux = s.split("=");
  if (morceaux.length > 2) return "illisible";
  const [g, d] = morceaux.length === 2 ? morceaux : ["y", morceaux[0]];
  if (g.trim() === "" || d.trim() === "") return "illisible";
  const R = (x: number, y: number): number | "illisible" => {
    try {
      return evaluerExpressionExponentielle(g, { x, y }) - evaluerExpressionExponentielle(d, { x, y });
    } catch {
      return "illisible";
    }
  };
  const xs = [-1.3, 0.4, 2.1];
  const ys: number[] = [];
  for (const x of xs) {
    const r0 = R(x, 0);
    const r1 = R(x, 1);
    const r2 = R(x, 2.7);
    if (r0 === "illisible" || r1 === "illisible" || r2 === "illisible") return "illisible";
    const pente = r1 - r0;
    if (!Number.isFinite(pente) || Math.abs(pente) < 1e-9) return "pas-une-droite";
    // Linéaire en y ?
    if (Math.abs(r0 + 2.7 * pente - r2) > 1e-6 * Math.max(1, Math.abs(r2))) return "pas-une-droite";
    ys.push(-r0 / pente);
  }
  const m = (ys[1] - ys[0]) / (xs[1] - xs[0]);
  const p = ys[0] - m * xs[0];
  if (Math.abs(p + m * xs[2] - ys[2]) > 1e-6 * Math.max(1, Math.abs(ys[2]))) return "pas-une-droite";
  return { m, p };
}
