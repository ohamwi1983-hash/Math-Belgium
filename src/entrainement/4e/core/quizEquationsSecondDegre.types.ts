/**
 * Contrat — "Équations et inéquations du second degré" (quiz vrai/faux), soixante-et-unième
 * générateur du projet, ajout ultérieur au chapitre 2 (regroupement historique, gen1-6 — voir
 * CLAUDE.md, section "Création — soixante-et-unième exercice"). Même principe que "Statistique
 * descriptive à une variable" (gen59) et "La fonction du second degré" (gen60) : banque de 140
 * affirmations vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 7 thèmes de 20 questions
 * chacun.
 *
 * **Contrairement à gen60 (chapitre 1), le discriminant Δ est pleinement mobilisé ici** : sa
 * formule, sa démonstration (complétion du carré), les relations de Viète (somme/produit des
 * racines) et la factorisation générale a(x-x1)(x-x2) sont chacun un thème dédié — ce sont
 * précisément les notions que gen60 excluait délibérément (pas encore vues à ce stade du
 * programme).
 */

export type VarianteQuizEquationsSecondDegre =
  | "vocabulaire"
  | "sansDiscriminant"
  | "discriminant"
  | "demonstration"
  | "sommeProduitRacines"
  | "factorisationGenerale"
  | "inequations";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que gen59/gen60). */
export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizEquationsSecondDegre {
  variante: VarianteQuizEquationsSecondDegre;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizEquationsSecondDegre = () => ExerciceQuizEquationsSecondDegre;
