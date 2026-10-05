/**
 * Couche B (5e) — vérification pour "Trigonométrie" (quiz vrai/faux, 5gen40). Aussi simple que
 * possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2
 * boutons, pas un champ de saisie libre) — même principe que
 * `moteur5e/verificationQuizFonctions5e.ts` (chapitre 1, 5gen39) et
 * `moteur/verificationQuizFonctionsReference.ts` (4e).
 */
import type { QuestionVraiFaux5e } from "../core5e/quizTrigonometrie5e.types";

export function verifierReponseVraiFaux5e(question: QuestionVraiFaux5e, reponse: boolean): boolean {
  return reponse === question.reponse;
}
