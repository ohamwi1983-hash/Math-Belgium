/**
 * Couche B (6e) — vérification pour "Les coniques" (quiz vrai/faux). Aussi simple que possible :
 * une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2 boutons, pas un
 * champ de saisie libre) — même principe que 6gen64/65/66/67/68/69/70/71/72.
 */
import type { QuestionVraiFaux } from "../core6e/quizConiques.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
