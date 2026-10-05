/**
 * Couche B (5e) — vérification pour "Dérivées et applications" (quiz vrai/faux, 5gen43). Aussi
 * simple que possible : une comparaison booléenne directe, aucun statut à 3 valeurs (choix
 * Vrai/Faux à 2 boutons, pas un champ de saisie libre) — même principe que
 * `moteur5e/verificationQuizLimites5e.ts` (chapitre 4, 5gen42), `moteur5e/verificationQuizSuites5e.ts`
 * (chapitre 3, 5gen41), `moteur5e/verificationQuizTrigonometrie5e.ts` (chapitre 2, 5gen40) et
 * `moteur/verificationQuizFonctionsReference.ts` (4e).
 */
import type { QuestionVraiFaux5e } from "../core5e/quizDerivees5e.types";

export function verifierReponseVraiFaux5e(question: QuestionVraiFaux5e, reponse: boolean): boolean {
  return reponse === question.reponse;
}
