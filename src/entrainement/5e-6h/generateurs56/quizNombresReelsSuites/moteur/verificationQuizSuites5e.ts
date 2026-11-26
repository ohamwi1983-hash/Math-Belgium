// Copie 5e (6h) de `5e-4h/moteur5e/verificationQuizSuites5e.ts` (56gen13 ← 5gen41, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
/**
 * Couche B (5e) — vérification pour "Suites" (quiz vrai/faux, 5gen41). Aussi simple que possible :
 * une comparaison booléenne directe, aucun statut à 3 valeurs (choix Vrai/Faux à 2 boutons, pas un
 * champ de saisie libre) — même principe que `moteur5e/verificationQuizTrigonometrie5e.ts`
 * (chapitre 2, 5gen40) et `moteur/verificationQuizFonctionsReference.ts` (4e).
 */
import type { QuestionVraiFaux5e } from "../core/quizSuites5e.types";

export function verifierReponseVraiFaux5e(question: QuestionVraiFaux5e, reponse: boolean): boolean {
  return reponse === question.reponse;
}
