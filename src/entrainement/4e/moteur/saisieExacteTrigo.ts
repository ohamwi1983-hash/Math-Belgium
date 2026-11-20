import { lireValeur, normaliserSaisieExacte } from "./verificationValeurExacte";

/**
 * Valeur EXACTE saisie dans un champ libre (gen16, gen78 — décision de l'utilisateur, audit 4e
 * ch. 5, question 3) : une forme exacte (« 2√2/3 », « rac(3)/2 », « −4/5 ») ou un décimal EXACT
 * (« 0,6 » pour 3/5) est jugé ; un décimal APPROCHÉ (« 0,94 » pour 2√2/3, « 0,33 » pour 1/3) est
 * refusé sans perte d'essai (`approchee`), comme gen76. `recopie` : sin, cos ou tan tapé dans le
 * champ ; `parse_error` : illisible. Ces trois statuts ne consomment jamais de tentative.
 */
export type StatutExactNumerique = "correct" | "faux" | "approchee" | "parse_error" | "recopie";

const TOLERANCE = 1e-9;

export function egalExact(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(b));
}

/** Fraction n/d (d ≤ 10 000) égale à x à 1e-9 près, sinon null (valeur irrationnelle). */
export function fractionProche(x: number): { n: number; d: number } | null {
  for (let d = 1; d <= 10000; d++) {
    const n = Math.round(x * d);
    if (Math.abs(x * d - n) < 1e-9 * d) return { n, d };
  }
  return null;
}

/** x s'écrit-il avec un nombre FINI de décimales (dénominateur 2^a·5^b) ? */
export function estDecimalExact(x: number): boolean {
  const f = fractionProche(x);
  if (!f) return false;
  let d = f.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

export function estSaisieDecimale(texte: string): boolean {
  return /\d[.,]\d|(^|[^\d])[.,]\d/.test(texte);
}

/** Valeur numérique de la saisie (null : illisible ou sin/cos/tan recopié). */
export function valeurSaisieExacte(texte: string): number | null {
  const s = normaliserSaisieExacte(texte);
  if (/sin|cos|tan/i.test(s)) return null;
  return lireValeur(s);
}

export function diagnostiquerExactNumerique(texte: string, cible: number): StatutExactNumerique {
  const s = normaliserSaisieExacte(texte);
  if (/sin|cos|tan/i.test(s)) return "recopie";
  const v = lireValeur(s);
  if (v === null) return "parse_error";
  if (estSaisieDecimale(s)) {
    if (estDecimalExact(cible) && egalExact(Math.abs(v), Math.abs(cible))) return egalExact(v, cible) ? "correct" : "faux";
    // Valeur approchée de la cible (ou de son opposé : la forme passe avant le signe).
    if (Math.abs(Math.abs(v) - Math.abs(cible)) <= Math.max(0.02, 0.01 * Math.abs(cible))) return "approchee";
    return "faux";
  }
  return egalExact(v, cible) ? "correct" : "faux";
}

export function sansTentative(s: StatutExactNumerique): boolean {
  return s === "approchee" || s === "parse_error" || s === "recopie";
}
