import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen18` (f(x) = a + b·ln(x)), statut à 3 valeurs
 * (`correct` / `not_equivalent` / `parse_error`). N'importe jamais rien de `src/generateurs6e/`.
 *
 * - **Écran « a »** : valeur numérique exacte (a est entier par construction).
 * - **Écran « équation en b »** : toute équation d'inconnue b dont la SEULE solution est la vraie
 *   valeur de b est acceptée (« 2 + b = 5 », « 2 + b·ln(e) = 5 », « a + b = 5 », « b = 3 »…) : le
 *   résidu gauche − droite doit s'annuler en b et pas en trois autres valeurs. `a` peut être écrit
 *   en lettre (remplacé par sa valeur confirmée à l'écran 1). Le piège du cours — écrire f(e) = a,
 *   donc une équation sans b ou de solution fausse — est refusé.
 * - **Écran « f(x) »** : expression en x équivalente à a + b·ln(x) sur ]0 ; +∞[ (échantillonnage) ;
 *   un préfixe « f(x) = » ou « y = » est toléré.
 */

const TOLERANCE = 1e-6;
const POINTS_X = [0.4, 1.3, 2.2, 3.7, 5.9];
/** Valeurs de b où le résidu NE doit PAS s'annuler — dont −b, pour refuser une équation à deux
 * solutions (ex. « b² = 9 ») dont une seule serait la bonne. */
const DECALAGES_B = [1, -1.5, 2.7];

function retirerPrefixe(texte: string, prefixes: RegExp): string {
  return texte.trim().replace(prefixes, "");
}

function evaluer(texte: string, variables: Record<string, number>): number | "parse_error" {
  try {
    return evaluerExpressionExponentielle(texte, variables);
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerLireA(exercice: ExerciceDeterminerParametresLogarithme, texte: string): StatutVerification {
  const valeur = evaluer(retirerPrefixe(texte, /^a\s*=/i), {});
  if (valeur === "parse_error") return "parse_error";
  return Number.isFinite(valeur) && Math.abs(valeur - exercice.a) < TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerEquationB(exercice: ExerciceDeterminerParametresLogarithme, texte: string): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  if (separe.symbole !== "=") return "not_equivalent";
  if (separe.gauche.trim() === "" || separe.droite.trim() === "") return "parse_error";
  const residu = (b: number): number | "parse_error" => {
    const g = evaluer(separe.gauche, { a: exercice.a, b });
    const d = evaluer(separe.droite, { a: exercice.a, b });
    if (g === "parse_error" || d === "parse_error") return "parse_error";
    return g - d;
  };
  const enSolution = residu(exercice.b);
  if (enSolution === "parse_error") return "parse_error";
  if (!Number.isFinite(enSolution) || Math.abs(enSolution) > 1e-6) return "not_equivalent";
  for (const bAilleurs of [...DECALAGES_B.map((delta) => exercice.b + delta), -exercice.b]) {
    const ailleurs = residu(bAilleurs);
    if (ailleurs === "parse_error") return "parse_error";
    if (!Number.isFinite(ailleurs) || Math.abs(ailleurs) < 1e-3) return "not_equivalent";
  }
  return "correct";
}

export function diagnostiquerFonction(exercice: ExerciceDeterminerParametresLogarithme, texte: string): StatutVerification {
  const expression = retirerPrefixe(texte, /^(f\s*\(\s*x\s*\)|y)\s*=/i);
  if (expression.includes("=")) return "parse_error";
  for (const x of POINTS_X) {
    const valeur = evaluer(expression, { x });
    if (valeur === "parse_error") return "parse_error";
    const attendu = exercice.a + exercice.b * Math.log(x);
    if (!Number.isFinite(valeur) || Math.abs(valeur - attendu) > TOLERANCE * Math.max(1, Math.abs(attendu))) return "not_equivalent";
  }
  return "correct";
}

export function verifierLireA(exercice: ExerciceDeterminerParametresLogarithme, texte: string): boolean {
  return diagnostiquerLireA(exercice, texte) === "correct";
}

export function verifierEquationB(exercice: ExerciceDeterminerParametresLogarithme, texte: string): boolean {
  return diagnostiquerEquationB(exercice, texte) === "correct";
}

export function verifierFonction(exercice: ExerciceDeterminerParametresLogarithme, texte: string): boolean {
  return diagnostiquerFonction(exercice, texte) === "correct";
}
