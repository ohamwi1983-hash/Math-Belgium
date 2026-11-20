/**
 * Couche B — vérification pour "L'un sans l'autre" (gen16).
 *
 * Décision de l'utilisateur (audit 4e ch. 5, question 3) : la réponse est une valeur EXACTE (forme
 * exacte, ou décimal exact comme 0,6). Une valeur décimale APPROCHÉE (« 0,94 » pour 2√2/3) est
 * refusée avec un message, sans perte d'essai, comme gen76 (`verificationValeurExacte.ts`, dont la
 * lecture de la saisie est reprise : « √3/2 », « rac(3)/2 », « sqrt(3)/2 », « − »). Une forme
 * équivalente non simplifiée (« √8/3 ») est acceptée.
 */
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { StatutVerification } from "./statutVerification";
import { valeurFinale } from "../ui/formatUnSansLautre";
import { diagnostiquerExactNumerique, type StatutExactNumerique } from "./saisieExacteTrigo";

/** Conservé pour les appelants historiques (tests) : `√` → `sqrt(…)`. */
export function normaliserRacinesUnSansLautre(texte: string): string {
  return texte
    .replace(/[−–]/g, "-")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/√\s*([0-9]+(?:[.,][0-9]+)?)/g, "sqrt($1)");
}

function versStatut(s: StatutExactNumerique): StatutVerification {
  return s === "correct" ? "correct" : s === "parse_error" || s === "recopie" ? "parse_error" : "not_equivalent";
}

export function cibleCarre(exercice: ExerciceUnSansLautre): number {
  return exercice.carreCibleNum / exercice.carreCibleDen;
}

export function statutCarre(exercice: ExerciceUnSansLautre, texte: string): StatutExactNumerique {
  return diagnostiquerExactNumerique(texte, cibleCarre(exercice));
}

export function statutValeurSignee(exercice: ExerciceUnSansLautre, texte: string): StatutExactNumerique {
  return diagnostiquerExactNumerique(texte, exercice.valeurCible);
}

export function statutTangente(exercice: ExerciceUnSansLautre, texte: string): StatutExactNumerique {
  return diagnostiquerExactNumerique(texte, valeurFinale(exercice));
}

export function diagnostiquerCarre(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return versStatut(statutCarre(exercice, texte));
}

export function verifierCarre(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return statutCarre(exercice, texte) === "correct";
}

export function diagnostiquerValeurSignee(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return versStatut(statutValeurSignee(exercice, texte));
}

export function verifierValeurSignee(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return statutValeurSignee(exercice, texte) === "correct";
}

/** Troisième écran : tan θ (variantes cos/sin données) ou sin θ (variante « tan θ donné »). */
export function diagnostiquerTangente(exercice: ExerciceUnSansLautre, texte: string): StatutVerification {
  return versStatut(statutTangente(exercice, texte));
}

export function verifierTangente(exercice: ExerciceUnSansLautre, texte: string): boolean {
  return statutTangente(exercice, texte) === "correct";
}
