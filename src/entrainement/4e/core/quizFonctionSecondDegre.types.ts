/**
 * Contrat — "La fonction du second degré" (quiz vrai/faux), soixantième générateur du projet,
 * ajout ultérieur au chapitre 1 ("Fonctions du second degré", gen7-9/55/57) — voir CLAUDE.md,
 * section "Création — soixantième exercice". Même principe que "Statistique descriptive à une
 * variable" (gen59, chapitre 5) : banque de 245 affirmations vrai/faux PRÉ-ÉCRITES (jamais
 * générées procéduralement), 7 thèmes de 35 questions chacun.
 *
 * **Aucune question ne suppose le discriminant Δ ni la formule (-b±√Δ)/2a** — méthode pas encore
 * vue à ce stade du programme. Les racines s'obtiennent uniquement par factorisation (mise en
 * évidence, binôme conjugué, produit remarquable) ou par un raisonnement graphique sur la position
 * du sommet — même contrainte que `generateurs/analyseFonction/` (gen7, "3 techniques sans Δ").
 */

export type VarianteQuizFonctionSecondDegre =
  | "coefficientsAllure"
  | "formeCanoniqueSommet"
  | "transformationsGraphiques"
  | "racinesFactorisation"
  | "domaineImageTableaux"
  | "optimisation"
  | "equationsContexte";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que gen59). */
export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizFonctionSecondDegre {
  variante: VarianteQuizFonctionSecondDegre;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizFonctionSecondDegre = () => ExerciceQuizFonctionSecondDegre;
