/**
 * Couche B (6e) — vérification pour "Probabilités" (quiz vrai/faux). Aussi simple que possible :
 * une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2 boutons, pas un
 * champ de saisie libre) — même principe que 6gen64/6gen65/6gen66/6gen67/6gen68.
 */
import type { QuestionVraiFaux } from "../core6e/quizProbabilites.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
