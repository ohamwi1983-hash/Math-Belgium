/**
 * Couche B (5e) — vérification pour "Fonctions : rappels et compléments" (quiz vrai/faux, 5gen39).
 * Aussi simple que possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix
 * Vrai/Faux à 2 boutons, pas un champ de saisie libre) — même principe que
 * `moteur/verificationQuizFonctionsReference.ts` (4e).
 */
import type { QuestionVraiFaux5e } from "../core5e/quizFonctions5e.types";

export function verifierReponseVraiFaux5e(question: QuestionVraiFaux5e, reponse: boolean): boolean {
  return reponse === question.reponse;
}
