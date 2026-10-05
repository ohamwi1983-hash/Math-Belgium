/**
 * Couche B — vérification pour "Cercle trigonométrique & triangles quelconques" (quiz vrai/faux).
 * Aussi simple que possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix
 * Vrai/Faux à 2 boutons, pas un champ de saisie libre) — même principe que
 * `verificationQuizFonctionsReference.ts`.
 */
import type { QuestionVraiFaux } from "../core/quizCercleTriangles.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
