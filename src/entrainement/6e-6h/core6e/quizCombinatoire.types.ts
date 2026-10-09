/**
 * Contrat — "Analyse combinatoire" (quiz vrai/faux), 6gen70, ajout ultérieur au chapitre 9 du
 * chantier 6e (6h) déjà complet (6gen43-48). Même principe que 6gen64 (chapitre 1), 6gen65
 * (chapitre 2), 6gen66 (chapitre 3), 6gen67 (chapitre 4), 6gen68 (chapitre 7) et 6gen69 (chapitre
 * 8) — banque de 210 affirmations vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 6 thèmes
 * de 35 questions chacun (20 d'origine + 15 d'enrichissement, voir `generateurs6e/quizCombinatoire/
 * banque.ts`) — mais contrat entièrement indépendant, jamais partagé entre chantiers ni
 * avec 6gen64/65/66/67/68/69 (voir CLAUDE.md, "3 chantiers indépendants").
 *
 * Les 6 thèmes reprennent exactement les 6 générateurs déjà établis du chapitre "Analyse
 * combinatoire" : dénombrement fondamental et arrangements (6gen43), dénombrement combiné et
 * sélections contraintes (6gen44), binôme de Newton (6gen45), dénombrement combinatoire pur :
 * problèmes (6gen46), probabilité hypergéométrique (6gen47), probabilité binomiale et séquence
 * exacte sans remise (6gen48).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65-69 —
 * pas de simples `string` — la densité de notation mathématique de ce chapitre (factorielles,
 * coefficients binomiaux C(n,k), arrangements A(n,k), sommes/produits de fractions) l'exige au
 * moins autant que les chapitres précédents. Motif `FragmentConsigne`/`texte`/`latex` copié
 * localement (jamais un import cross-fichier d'un autre chantier ou d'un autre quiz).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizCombinatoire =
  | "denombrementFondamental"
  | "denombrementCombine"
  | "binomeNewton"
  | "denombrementProblemes"
  | "probabiliteHypergeometrique"
  | "binomialeSequence";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64-69), mais énoncé/
 * justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizCombinatoire {
  variante: VarianteQuizCombinatoire;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizCombinatoire = () => ExerciceQuizCombinatoire;
