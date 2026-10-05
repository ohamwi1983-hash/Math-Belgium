/**
 * Couche B — vérification pour "Caractéristiques d'une fonction & fonctions de référence" (quiz
 * vrai/faux). Aussi simple que possible : une comparaison booléenne directe, aucun statut à 3
 * valeurs (choix Vrai/Faux à 2 boutons, pas un champ de saisie libre) — même principe que
 * `verificationQuizEquationsSecondDegre.ts`.
 */
import type { QuestionVraiFaux } from "../core/quizFonctionsReference.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
