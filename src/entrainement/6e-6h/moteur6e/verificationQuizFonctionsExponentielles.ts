/**
 * Couche B (6e) — vérification pour "Fonctions exponentielles" (quiz vrai/faux). Aussi simple que
 * possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2
 * boutons, pas un champ de saisie libre) — même principe que 6gen64 et les 4 quiz vrai/faux du
 * chantier 4e.
 */
import type { QuestionVraiFaux } from "../core6e/quizFonctionsExponentielles.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
