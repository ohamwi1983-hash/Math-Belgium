/**
 * Couche B — vérification pour 5gen4 ("Composée de fonctions et image d'un réel — lecture
 * graphique"). Le champ résultat accepte un texte libre — tout nombre réel, négatifs et décimaux
 * compris (E.4, `promptcorrectionsregroupees.md`) — plutôt qu'un champ numérique restreint :
 * réutilise `parserNombreOuFraction` (`moteur/verificationAnalyseFonction.ts`, cross-chantier déjà
 * établi ailleurs sur le chantier 5e, ex. `verificationDecompositionFonction.ts`) pour parser, et le
 * statut à 3 valeurs (`StatutVerification`, convention A.1) pour distinguer un texte illisible
 * (parse_error) d'une vraie erreur de calcul (not_equivalent) — jamais confondus.
 *
 * **Retrait du champ intermédiaire g(a)** (retour utilisateur direct, au-delà de la spec d'origine) :
 * l'élève ne soumet plus la valeur intermédiaire b — seulement l'existence et la valeur du résultat
 * final f(g(a)). La lecture de b reste guidée par l'aide (`ui5e/formatComposeeGraphique.ts`,
 * `pointRevele` sur le graphe de la fonction interne), mais n'est plus un champ scoré séparément.
 */
import type { QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import type { StatutVerification } from "../moteur/statutVerification";

export interface ReponseQuestionComposeeGraphique {
  /** l'élève a-t-il choisi "n'existe pas" pour le résultat final ? */
  resultatExiste: boolean;
  /** ignoré si `resultatExiste===false`. */
  resultatValeur: string | null;
}

function resultatValeurParsee(reponse: ReponseQuestionComposeeGraphique): number | null {
  return reponse.resultatValeur === null ? null : parserNombreOuFraction(reponse.resultatValeur);
}

/** "N'existe pas" est une réponse correcte À PART ENTIÈRE quand `resultatExiste===false` — jamais
 * une variante de "faux" (spec explicite). */
export function verifierResultatFinal(question: QuestionComposeeGraphique, reponse: ReponseQuestionComposeeGraphique): boolean {
  if (reponse.resultatExiste !== question.resultatExiste) return false;
  if (!question.resultatExiste) return true;
  const v = resultatValeurParsee(reponse);
  return v !== null && v === question.resultatAttendu;
}

export function verifierReponseQuestion(question: QuestionComposeeGraphique, reponse: ReponseQuestionComposeeGraphique): boolean {
  return verifierResultatFinal(question, reponse);
}

/**
 * Statut à 3 valeurs (A.1) : parse_error dès que le champ résultat (requis seulement si "Existe" est
 * sélectionné) n'a pas pu être interprété comme un nombre — jamais confondu avec une valeur
 * numérique juste fausse.
 */
export function diagnostiquerReponseQuestion(question: QuestionComposeeGraphique, reponse: ReponseQuestionComposeeGraphique): StatutVerification {
  if (reponse.resultatExiste && resultatValeurParsee(reponse) === null) return "parse_error";
  return verifierReponseQuestion(question, reponse) ? "correct" : "not_equivalent";
}
