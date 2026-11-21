/**
 * Lecture des saisies de 5gen20–5gen24 (5e ch. 4, lots B–D — règles communes, modèle du 5e ch. 1) :
 * la frappe n'est jamais bloquée, la saisie est lue APRÈS coup.
 * - Un nombre se lit avec `lireLimite` (lot G) : entier, fraction, décimal, racine, « − – — », et
 *   aussi un infini (« +∞ », « ∞ », « −∞ », « inf », « -inf », « plus l'infini ») — un infini tapé dans
 *   un champ qui attend un nombre fini est LISIBLE (réponse fausse, message ciblé), jamais illisible.
 * - Une saisie ILLISIBLE, ou une valeur APPROCHÉE d'une valeur exacte attendue, est refusée par le
 *   MOTEUR (`soumettre*` rend l'état inchangé) : aucune tentative consommée, l'écran le dit.
 * - Une expression en x se lit avec `lireFonctionX` (lot G : √, |…|, produits implicites, « y = »).
 */
import type { StatutVerification } from "../moteur/statutVerification";
import { estApprochee, lireFonctionX, lireLimite, memeLimite } from "./lectureLimitesLotG";

export { lireLimite, memeLimite };

/** Le nombre (ou l'infini) n'est pas lisible. */
export function nombreIllisible(brut: string): boolean {
  return lireLimite(brut) === null;
}

/** Saisie d'une valeur EXACTE refusée sans tentative : illisible, ou décimale approchée. */
export function nombreExactRefuse(brut: string, attendu: number): boolean {
  return lireLimite(brut) === null || estApprochee(brut, attendu);
}

/** Valeur exacte (ou infini) : `memeLimite` à 1e-9 près — une approximation n'est jamais « correcte ». */
export function diagnostiquerValeurExacte(brut: string, attendu: number): StatutVerification {
  const v = lireLimite(brut);
  if (v === null) return "parse_error";
  return memeLimite(v, attendu) ? "correct" : "not_equivalent";
}

/** Valeur approchée attendue (arrondie) : lisible, comparée avec la tolérance donnée. */
export function diagnostiquerValeurApprochee(brut: string, attendu: number, tolerance: number): StatutVerification {
  const v = lireLimite(brut);
  if (v === null) return "parse_error";
  if (!Number.isFinite(v)) return "not_equivalent";
  return Math.abs(v - attendu) <= tolerance ? "correct" : "not_equivalent";
}

/** L'expression en x n'est pas lisible (syntaxe). */
export function expressionIllisible(brut: string): boolean {
  return lireFonctionX(brut) === null;
}

/** Plusieurs expressions : au moins une illisible. */
export function expressionsIllisibles(bruts: string[]): boolean {
  return bruts.some((b) => b.trim() !== "" && expressionIllisible(b));
}

/** Valeur d'une expression en x (null si illisible ou non définie en x). */
export function valeurExpression(brut: string, x: number): number | null {
  const f = lireFonctionX(brut);
  if (!f) return null;
  try {
    const v = f(x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Polynôme (coefficients `c[i]` de xⁱ) égal à l'expression saisie en 6 points ? */
export function egalAuPolynome(brut: string, coeffs: number[]): boolean {
  const f = lireFonctionX(brut);
  if (!f) return false;
  for (const x of [0.5, 1.7, -2.3, 3.1, -0.9, 4.4]) {
    let attendu = 0;
    for (let d = 0; d < coeffs.length; d++) attendu += coeffs[d] * x ** d;
    let v: number;
    try {
      v = f(x);
    } catch {
      return false;
    }
    if (!Number.isFinite(v) || Math.abs(v - attendu) > 1e-6 * Math.max(1, Math.abs(attendu))) return false;
  }
  return true;
}

/** Expression saisie égale à g en 6 points où g est définie ? */
export function egaleA(brut: string, g: (x: number) => number): boolean {
  const f = lireFonctionX(brut);
  if (!f) return false;
  let n = 0;
  for (const x of [0.5, 1.7, -2.3, 3.1, -0.9, 4.4, 6.3, -5.1]) {
    const b = g(x);
    if (!Number.isFinite(b)) continue;
    let a: number;
    try {
      a = f(x);
    } catch {
      return false;
    }
    if (!Number.isFinite(a) || Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b))) return false;
    n++;
  }
  return n >= 4;
}
