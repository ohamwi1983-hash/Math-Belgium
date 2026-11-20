import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Lecture des saisies des générateurs 6gen144–6gen147 (6e ch. 2, lot G), au-dessus de l'évaluateur
 * partagé du chapitre (`expressionExponentielle.ts` : `e`, `ln`, `sqrt`/`√`, `^`, `²`, fractions,
 * virgule décimale, « − », « · », « × »). Ajouts : accolades `{…}` lues comme des parenthèses
 * (« e^{2} »), infini (« +∞ », « -inf », « infini »), ensemble fini (« 2 ; -1 », « {2} », « ∅ »),
 * fonction de x (préfixe « f'(x) = » ou « y = » ignoré). Toute écriture juste est acceptée : la
 * comparaison est NUMÉRIQUE (écart relatif 1e-9), jamais sur la forme ; une saisie illisible rend
 * `null` (statut `parse_error`, aucune tentative consommée par l'écran) ; une valeur décimale proche
 * de la valeur exacte attendue est signalée « approchée » (message sans tentative) quand la consigne
 * demande la forme exacte.
 */

const EPS = 1e-9;

/** Écritures typographiques et accolades → syntaxe de l'évaluateur. */
export function preparer(texte: string): string {
  return texte
    .replace(/[−–—]/g, "-")
    .replace(/[{[]/g, "(")
    .replace(/[}\]]/g, ")")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\ln/g, "ln")
    .replace(/[   ]/g, " ")
    // Espace des milliers (« 12 282,5 ») : sinon lue comme un produit implicite 12 × 282,5.
    .replace(/(\d) (?=\d{3}(?![\d]))/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Égalité numérique (écart relatif). */
export function egal(a: number, b: number, tol = EPS): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

/** La saisie contient-elle un nombre décimal écrit (« 4,16 », « 0.69 ») ? */
export function contientDecimal(texte: string): boolean {
  return /\d[.,]\d/.test(texte);
}

/** Valeur numérique d'une saisie sans variable ; `null` = illisible (ou vide / non finie). */
export function lireNombre(texte: string): number | null {
  const s = preparer(texte);
  if (s === "") return null;
  try {
    const v = evaluerExpressionExponentielle(s, {});
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Infini écrit au clavier : `+1`, `-1`, ou `0` si ce n'est pas un infini. */
function signeInfini(texte: string): 1 | -1 | 0 {
  const s = preparer(texte).toLowerCase().replace(/\s+/g, "").replace(/’/g, "'");
  if (/^(\+|plus)?(l')?(∞|inf|infini|infinity)$/.test(s)) return 1;
  if (/^(-|moins)(l')?(∞|inf|infini|infinity)$/.test(s)) return -1;
  return 0;
}

/** Une limite : un nombre, ou ±∞ (`Infinity`). */
export function lireLimite(texte: string): number | null {
  const sg = signeInfini(texte);
  if (sg !== 0) return sg * Infinity;
  return lireNombre(texte);
}

/** Une fonction de `variable` (préfixe « f'(x) = », « f(x) = », « y = » ignoré) ; `null` = illisible. */
export function lireFonction(texte: string, variable = "x"): ((x: number) => number) | null {
  let s = preparer(texte).replace(/^\s*(?:[fgh][′']*\s*\(\s*[a-z]\s*\)|y)\s*=\s*/i, "");
  if (s === "") return null;
  s = s.replace(/′/g, "'");
  try {
    evaluerExpressionExponentielle(s, { [variable]: 0.731 });
  } catch {
    return null;
  }
  return (x: number) => {
    try {
      return evaluerExpressionExponentielle(s, { [variable]: x });
    } catch {
      return NaN;
    }
  };
}

/** Deux fonctions égales en chacun des points (au moins 3 points où les deux sont définies). */
export function memesFonctions(f: (x: number) => number, g: (x: number) => number, points: number[]): boolean {
  let n = 0;
  for (const x of points) {
    const a = f(x);
    const b = g(x);
    if (!Number.isFinite(b)) continue;
    if (!Number.isFinite(a) || !egal(a, b, 1e-7)) return false;
    n++;
  }
  return n >= 3;
}

/** Ensemble fini saisi (« 2 ; -1 », « S = {2} », « ∅ », « aucune ») ; `null` = illisible. */
export function lireEnsemble(texte: string): number[] | null {
  let s = texte.trim().replace(/^S\s*=\s*/i, "").trim();
  if (/^(∅|\{\s*\}|vide|ensemble vide|aucune?( solution)?|pas de solution)$/i.test(s)) return [];
  s = s.replace(/^\{/, "").replace(/\}$/, "");
  const parts = s.split(/;|\bet\b|\bou\b/).map((p) => p.trim()).filter((p) => p !== "");
  if (parts.length === 0) return null;
  const vals: number[] = [];
  for (const p of parts) {
    const v = lireNombre(p.replace(/^x\s*=\s*/i, ""));
    if (v === null) return null;
    vals.push(v);
  }
  return vals;
}

/** Même ensemble (ordre et répétitions sans importance). */
export function memesEnsembles(saisi: number[], attendu: number[]): boolean {
  const uniques: number[] = [];
  for (const v of saisi) if (!uniques.some((u) => egal(u, v))) uniques.push(v);
  return uniques.length === attendu.length && attendu.every((a) => uniques.some((u) => egal(u, a)));
}

/** Statut d'un champ « nombre exact ». */
export function statutNombre(texte: string, attendu: number): StatutVerification {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return egal(v, attendu) ? "correct" : "not_equivalent";
}

/** Statut d'un champ « limite » (nombre exact ou ±∞). */
export function statutLimite(texte: string, attendu: number): StatutVerification {
  const v = lireLimite(texte);
  if (v === null) return "parse_error";
  return egal(v, attendu) ? "correct" : "not_equivalent";
}

/** Saisie décimale proche (2 %) d'une valeur exacte attendue, sans lui être égale : valeur approchée. */
export function estApprochee(texte: string, attendu: number): boolean {
  if (!contientDecimal(texte) || !Number.isFinite(attendu)) return false;
  const v = lireNombre(texte);
  if (v === null || egal(v, attendu)) return false;
  return Math.abs(v - attendu) <= 0.02 * Math.max(Math.abs(attendu), 0.05);
}

/** Message commun « valeur approchée » (aucune tentative consommée). */
export const MESSAGE_APPROCHEE =
  "Ta valeur est une valeur approchée : on demande la valeur exacte (fraction, puissance, ln, e…). Cela ne compte pas comme une tentative.";
