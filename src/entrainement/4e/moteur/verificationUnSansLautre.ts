/**
 * Couche B — vérification pour "L'un sans l'autre" (chapitre 3, seizième générateur) :
 * correction NUMÉRIQUE de la valeur (statut à 3 valeurs, `evaluerExpressionGenerale` — module
 * frère, jamais dupliqué). Une forme équivalente non simplifiée est acceptée telle quelle.
 */
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.005;

function diagnostiquerReponseNumerique(cible: number, texte: string): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(texte, 0);
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
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
