/**
 * Couche B — vérification pour "L'un sans l'autre" (chapitre 3, seizième générateur) :
 * correction NUMÉRIQUE de la valeur (statut à 3 valeurs, `evaluerExpressionGenerale` — module
 * frère, jamais dupliqué). Une forme équivalente non simplifiée est acceptée telle quelle.
 */
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.005;

/**
 * Notation « √ » tapée au clavier (ou via le clavier mobile) → `sqrt(…)`, LOCALEMENT à ce générateur :
 * le parseur partagé (`evaluerExpressionGenerale`) ne la connaît pas. `√(…)` → `sqrt(…)`, `√5` ou
 * `√2,5` → `sqrt(5)`/`sqrt(2,5)` ; le signe moins typographique « − » devient « - ».
 */
export function normaliserRacinesUnSansLautre(texte: string): string {
  return texte
    .replace(/[−–]/g, "-")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/√\s*([0-9]+(?:[.,][0-9]+)?)/g, "sqrt($1)");
}

function diagnostiquerReponseNumerique(cible: number, texte: string): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(normaliserRacinesUnSansLautre(texte), 0);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(valeur)) return "parse_error";
  // Marge d'arrondi flottant : une réponse arrondie au centième pile à 0,005 de la cible reste acceptée.
  return Math.abs(valeur - cible) <= TOLERANCE + 1e-9 ? "correct" : "not_equivalent";
}

export function diagnostiquerCarre(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.carreCibleNum / exercice.carreCibleDen, texte);
}

export function verifierCarre(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerCarre(exercice, texte) === "correct";
}

export function diagnostiquerValeurSignee(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.valeurCible, texte);
}

export function verifierValeurSignee(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerValeurSignee(exercice, texte) === "correct";
}

export function diagnostiquerTangente(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return diagnostiquerReponseNumerique(exercice.tanValeur, texte);
}

export function verifierTangente(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return diagnostiquerTangente(exercice, texte) === "correct";
}
