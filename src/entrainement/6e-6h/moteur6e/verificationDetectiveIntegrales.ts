import type { ExerciceDetectiveIntegrales, IdDescriptionIntegrales, ValeurLigne } from "../core6e/detectiveIntegrales.types";
import { descriptionCorrecte, indiceLigneFausse, valeurExacte, valeursAttendues } from "./modeleDetectiveIntegrales";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Vérification de 6gen84. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : chaque valeur est comparée à la valeur EXACTE, avec l'évaluateur d'expressions
 * du chapitre (même saisie que 6gen25/6gen26 : fractions, ln, π (pi), e, √ (rac), |…|) :
 * - un nombre : toute écriture exacte équivalente (« -3ln(2) », « 3ln(1/2) », « 9pi/2 ») ;
 *   une valeur DÉCIMALE proche mais non exacte est signalée « approchée » sans consommer de
 *   tentative (la consigne demande la valeur exacte) ;
 * - une fonction : comparée en plusieurs points du domaine de l'exercice ; une primitive est
 *   acceptée à une constante près quand la ligne demande « une primitive » (la lettre C, si l'élève
 *   l'écrit, vaut alors 0).
 */

export type StatutChamp = "correct" | "faux" | "parse_error" | "approchee";

function preparer(texte: string): string {
  return texte
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/(\d),(\d)/g, "$1.$2");
}

function proche(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

export function diagnostiquerNombre(texte: string, cible: number): StatutChamp {
  const s = preparer(texte);
  if (s === "") return "parse_error";
  let v: number;
  try {
    v = evaluerExpressionExponentielle(s, {});
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(v)) return "faux";
  if (proche(v, cible, 1e-9)) return "correct";
  if (/\d\.\d/.test(s) && proche(v, cible, 5e-3)) return "approchee";
  return "faux";
}

export function diagnostiquerFonction(texte: string, v: Extract<ValeurLigne, { genre: "fonction" }>): StatutChamp {
  const s = preparer(texte);
  if (s === "") return "parse_error";
  const lus: number[] = [];
  for (const p of v.points) {
    try {
      lus.push(evaluerExpressionExponentielle(s, v.aConstantePres ? { [v.variable]: p, c: 0 } : { [v.variable]: p }));
    } catch {
      return "parse_error";
    }
  }
  if (lus.some((x) => !Number.isFinite(x))) return "faux";
  const ecarts = lus.map((x, i) => x - v.f(v.points[i]!));
  if (v.aConstantePres) return ecarts.every((d) => proche(d, ecarts[0]!, 1e-7)) ? "correct" : "faux";
  return ecarts.every((d, i) => proche(d + v.f(v.points[i]!), v.f(v.points[i]!), 1e-7)) ? "correct" : "faux";
}

export function verifierLigne(e: ExerciceDetectiveIntegrales, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveIntegrales, choix: IdDescriptionIntegrales): boolean {
  return choix === descriptionCorrecte(e);
}

/** Statut de chaque valeur attendue. */
export function diagnostiquerCorrection(e: ExerciceDetectiveIntegrales, textes: string[]): StatutChamp[] {
  return valeursAttendues(e).map((v, i) => (v.genre === "nombre" ? diagnostiquerNombre(textes[i] ?? "", valeurExacte(v.termes)) : diagnostiquerFonction(textes[i] ?? "", v)));
}
