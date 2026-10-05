/**
 * Couche B — vérification pour "Géométrie analytique plane" (quiz vrai/faux). Aussi simple que
 * possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2
 * boutons, pas un champ de saisie libre) — même principe que `verificationQuizCalculVectoriel.ts`.
 */
import type { QuestionVraiFaux } from "../core/quizGeometrieAnalytique.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
