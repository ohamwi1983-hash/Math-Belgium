import type { QuadrantStrict, TermeTrig } from "../core/valeurExacte.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { estRationnel, valeurApprochee, type NombreExact } from "./corpsValeurExacte";
import { angleAssocie, angleReduit, quadrantDe, signeDe, valeurFonction, valeurRemarquable } from "./modeleValeurExacte";

/**
 * Vérification de gen76.
 *
 * Valeur EXACTE (valeur d'un terme, valeur de l'expression) : la saisie (« rac(3)/2 »,
 * « (2+rac(6))/4 », « −1/2 », « √3/2 »…) est évaluée numériquement par `evaluerExpressionGenerale`
 * et comparée à la valeur exacte, calculée sans flottant (`corpsValeurExacte.ts`), à 1e-9 près.
 * Statuts distincts, qui NE consomment PAS de tentative (décision de gen76, comme une saisie
 * illisible et comme les valeurs approchées de 5e ch. 5) :
 * - `approchee` : un nombre décimal proche de la valeur (« 0,866 » pour √3/2). La valeur trouvée
 *   est la bonne, seule la FORME ne va pas : on explique qu'une valeur exacte est demandée, sans
 *   pénaliser un élève qui a bien raisonné. Un décimal n'est accepté que s'il est EXACT (« 0,5 »
 *   pour 1/2, « −1,5 ») — jamais pour une valeur irrationnelle, même tapée avec 16 décimales.
 * - `recopie` : sin, cos ou tan tapé dans le champ (l'évaluateur calcule sinon sin(150) en degrés).
 * Statuts qui consomment une tentative, avec un message ciblé (pièges du chapitre) : `signe` (bonne
 * valeur absolue, mauvais signe — quadrant), `cofonction` (valeur du sinus au lieu du cosinus ou
 * l'inverse : cos 60° et sin 60° confondus), `faux`.
 */

export type StatutExact = "correct" | "faux" | "signe" | "cofonction" | "approchee" | "recopie" | "parse_error";
export type StatutAngle = "correct" | "faux" | "non-transforme" | "hors-intervalle" | "parse_error";

const TOLERANCE = 1e-9;

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE * Math.max(1, Math.abs(b));
}

/** « − », « – », « √3 », « √(…) », espaces : ramenés à la syntaxe de l'évaluateur. */
export function normaliserSaisieExacte(texte: string): string {
  return texte
    .replace(/[−–—]/g, "-")
    .replace(/√\s*\(/g, "rac(")
    .replace(/√\s*(\d+)/g, "rac($1)")
    .trim();
}

function estDecimalExact(x: NombreExact): boolean {
  if (!estRationnel(x)) return false;
  let d = x[0].d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Valeur lue, ou `null` si la saisie est illisible (identifiant inconnu, x, π…). */
function lireValeur(s: string): number | null {
  if (s === "") return null;
  if (/[a-z]/i.test(s.replace(/racine|rac|sqrt/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function diagnostiquerValeurExacte(texte: string, cible: NombreExact, autre?: NombreExact): StatutExact {
  const s = normaliserSaisieExacte(texte);
  if (/sin|cos|tan/i.test(s)) return "recopie";
  const v = lireValeur(s);
  if (v === null) return "parse_error";
  const t = valeurApprochee(cible);
  const decimal = /\d[.,]\d|(^|[^\d])[.,]\d/.test(s);
  if (decimal) {
    if (egal(v, t) && estDecimalExact(cible)) return "correct";
    if (Math.abs(v - t) <= Math.max(0.02, 0.01 * Math.abs(t))) return "approchee";
    return Math.abs(v + t) <= Math.max(0.02, 0.01 * Math.abs(t)) && t !== 0 ? "signe" : "faux";
  }
  if (egal(v, t)) return "correct";
  if (t !== 0 && egal(v, -t)) return "signe";
  if (autre) {
    const a = valeurApprochee(autre);
    if (!egal(Math.abs(a), Math.abs(t)) && egal(Math.abs(v), Math.abs(a))) return "cofonction";
  }
  return "faux";
}

/** Valeur de la co-fonction (sin ↔ cos) sur le même angle, pour détecter la confusion ; aucune
 * pour une tangente. */
export function valeurCofonction(t: TermeTrig): NombreExact | undefined {
  if (t.fonction === "tan") return undefined;
  return valeurRemarquable(t.fonction === "sin" ? "cos" : "sin", angleAssocie(t));
}

/** Angle en degrés : nombre (virgule ou point), « ° » toléré. `null` si illisible. */
export function lireAngle(texte: string): number | null {
  const s = texte.replace(/[−–—]/g, "-").replace(/[°\s]/g, "").replace(",", ".");
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

export function diagnostiquerReduction(texte: string, t: TermeTrig): StatutAngle {
  const v = lireAngle(texte);
  if (v === null) return "parse_error";
  if (v === angleReduit(t.angle)) return "correct";
  return Number.isInteger(v) && angleReduit(v) === angleReduit(t.angle) ? "hors-intervalle" : "faux";
}

export function diagnostiquerAngleAssocie(texte: string, t: TermeTrig): StatutAngle {
  const v = lireAngle(texte);
  if (v === null) return "parse_error";
  if (v === angleAssocie(t)) return "correct";
  return v === angleReduit(t.angle) || v === t.angle ? "non-transforme" : "faux";
}

export function diagnostiquerValeurTerme(texte: string, t: TermeTrig): StatutExact {
  return diagnostiquerValeurExacte(texte, valeurFonction(t), valeurCofonction(t));
}

/** Écran « quadrant et signe » (choix fermés). */
export function verifierPlacement(t: TermeTrig, quadrant: QuadrantStrict, signe: 1 | -1): boolean {
  return quadrant === quadrantDe(t) && signe === signeDe(t);
}

/** Statut qui ne consomme pas de tentative : la saisie est renvoyée à l'élève avec un message. */
export function statutSansTentative(s: StatutExact | StatutAngle): boolean {
  return s === "parse_error" || s === "approchee" || s === "recopie";
}
