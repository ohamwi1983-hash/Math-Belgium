/**
 * Contrat — "La fonction du second degré" (quiz vrai/faux), soixantième générateur du projet,
 * ajout ultérieur au chapitre 1 ("Fonctions du second degré", gen7-9/55/57) — voir CLAUDE.md,
 * section "Création — soixantième exercice". Même principe que "Statistique descriptive à une
 * variable" (gen59, chapitre 5) : banque d'affirmations vrai/faux PRÉ-ÉCRITES (jamais
 * générées procéduralement), 10 thèmes de 35 questions (350, voir `banque.ts`).
 *
 * **Aucune question ne suppose la formule générale des racines** — pas encore vue à ce stade du
 * programme. Les zéros s'obtiennent uniquement par factorisation (mise en évidence, binôme
 * conjugué, carré parfait) ou par un raisonnement graphique sur la position du sommet.
 */

export type VarianteQuizFonctionSecondDegre =
  | "coefficientsAllure"
  | "lectureGraphique"
  | "differencesSecondes"
  | "racinesFactorisation"
  | "domaineImageTableaux"
  | "transformationsGraphiques"
  | "formeCanoniqueSommet"
  | "completerCarre"
  | "troisEcritures"
  | "optimisation";

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
