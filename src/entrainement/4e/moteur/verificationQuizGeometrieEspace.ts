import type { QuestionVraiFaux } from "../core/quizGeometrieEspace.types";

export function verifierReponseVraiFaux(question: QuestionVraiFaux, reponse: boolean): boolean {
  return reponse === question.reponse;
}
