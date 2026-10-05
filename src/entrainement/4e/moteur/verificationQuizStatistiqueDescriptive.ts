/**
 * Couche B — vérification pour "Statistique descriptive à une variable" (quiz vrai/faux).
 * Aussi simple que possible : une comparaison booléenne directe, aucun statut à 3 valeurs (ce
 * n'est pas un champ de saisie libre, mais un choix Vrai/Faux à 2 boutons — même principe que
 * les questions QCM A/B de "Comparaison de deux séries statistiques").
 */
import type { QuestionVraiFaux } from "../core/quizStatistiqueDescriptive.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
