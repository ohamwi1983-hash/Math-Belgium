import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { lireValeur } from "./lectureValeurTrigo";
import { lireExpression } from "./verificationDetectiveFonctions";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";

/**
 * Lecture des saisies des générateurs du lot G du 5e ch. 4 (5gen64–5gen67) — jamais de blocage de
 * frappe : la saisie est lue APRÈS coup, `null` = illisible (l'écran le dit, aucune tentative).
 * - `lireLimite` : un nombre exact (entier, fraction, décimal, racine : `lireValeur`) ou un infini
 *   (« +∞ », « ∞ », « −∞ », « +inf », « inf », « -inf », « +infini », « plus l'infini ») ; préfixe
 *   « lim … = » ou « L = » recopié ignoré.
 * - `lireFonctionX` : une expression en x (√, racine(…), sqrt(…), |…|, produits implicites, « − – — »),
 *   préfixe « y = », « f(x) = » ignoré (`lireExpression` du 5e ch. 1).
 */

const INFINI = /^(\+)?\s*(∞|inf|infini|infinity|l'?infini|plus\s*l'?infini|\\infty)$/i;
const MOINS_INFINI = /^(-\s*(∞|inf|infini|infinity|l'?infini|\\infty)|moins\s*l'?infini)$/i;

export function lireLimite(brut: string): number | null {
  let s = normaliserSigneMoins(brut).replace(/[’`]/g, "'").trim();
  s = s.replace(/^.*=/, "").trim();
  if (s === "") return null;
  const compact = s.replace(/\s+/g, " ");
  if (INFINI.test(compact)) return Infinity;
  if (MOINS_INFINI.test(compact)) return -Infinity;
  return lireValeur(s);
}

/** Valeur décimale écrite (sans racine ni fraction) proche d'une valeur exacte : approchée. */
export function estApprochee(brut: string, attendu: number): boolean {
  if (!Number.isFinite(attendu)) return false;
  const v = lireLimite(brut);
  if (v === null || !Number.isFinite(v)) return false;
  if (Math.abs(v - attendu) < 1e-9 * Math.max(1, Math.abs(attendu))) return false;
  if (!/\d[.,]\d/.test(brut) || /√|sqrt|racine|\//i.test(brut)) return false;
  return Math.abs(v - attendu) <= 6e-3 * Math.max(1, Math.abs(attendu));
}

/** Deux limites égales (infinis de même signe, ou nombres égaux à 1e-9 près). */
export function memeLimite(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
}

/** Lisible = la syntaxe est reconnue (une expression hors de son domaine en un point n'est pas
 * illisible : √(x² + 5x − 4) n'existe pas en x = 0,37 mais se lit très bien). */
export function lireFonctionX(brut: string): ((x: number) => number) | null {
  const directe = lireExpression(brut);
  if (directe) return directe;
  let s = normaliserSigneMoins(brut).trim();
  s = s.replace(/^.*=/, "").trim().replace(/,/g, ".");
  if (s === "" || /[a-wyzA-WYZ]/.test(s.replace(/sqrt|abs|racine/g, ""))) return null;
  for (const x of [3.7, -3.7, 37, -37, 0.37, 370]) {
    try {
      const v = evaluerExpressionGenerale(s, x);
      if (Number.isFinite(v)) return (t: number) => evaluerExpressionGenerale(s, t);
    } catch {
      return null;
    }
  }
  return null;
}

/** Deux fonctions égales aux points donnés (points où les deux existent ; au moins 3). */
export function memesValeurs(f: (x: number) => number, g: (x: number) => number, points: number[]): boolean {
  let n = 0;
  for (const x of points) {
    const a = f(x);
    const b = g(x);
    if (!Number.isFinite(b)) continue;
    if (!Number.isFinite(a)) return false;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return false;
    n++;
  }
  return n >= 3;
}

/** La saisie contient-elle une racine carrée ? */
export const contientRacine = (brut: string): boolean => /√|sqrt|racine|rac\(/i.test(brut);
