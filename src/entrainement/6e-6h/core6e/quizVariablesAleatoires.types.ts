/**
 * Contrat — "Variables aléatoires et lois de probabilités" (quiz vrai/faux), 6gen71, ajout
 * ultérieur au chapitre 10 du chantier 6e (6h) déjà complet (6gen49-53). Même principe que 6gen64
 * (chapitre 1), 6gen65 (chapitre 2), 6gen66 (chapitre 3), 6gen67 (chapitre 4), 6gen68 (chapitre 7),
 * 6gen69 (chapitre 8) et 6gen70 (chapitre 9) — banque de 175 affirmations vrai/faux PRÉ-ÉCRITES
 * (jamais générées procéduralement), 5 thèmes de 35 questions chacun — mais contrat entièrement
 * indépendant, jamais partagé entre chantiers ni avec 6gen64/65/66/67/68/69/70 (voir CLAUDE.md, "3
 * chantiers indépendants").
 *
 * Les 5 thèmes reprennent exactement les 5 générateurs déjà établis du chapitre "Variables
 * aléatoires et lois de probabilités" : variables aléatoires discrètes et espérance (6gen49), loi
 * binomiale (6gen50), loi normale (6gen51), extensions binomiale/normale/Bayes (6gen52), loi de
 * Poisson (6gen53).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65-70 —
 * pas de simples `string` — la densité de notation mathématique de ce chapitre (E(X), V(X), loi
 * binomiale B(n,p), fonction de répartition Φ, standardisation Z=(X-μ)/σ, formule de Bayes, loi de
 * Poisson) l'exige au moins autant que les chapitres précédents. Motif `FragmentConsigne`/`texte`/
 * `latex` copié localement (jamais un import cross-fichier d'un autre chantier ou d'un autre quiz).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizVariablesAleatoires =
  | "variablesDiscretesEsperance"
  | "loiBinomiale"
  | "loiNormale"
  | "extensionsBinomialeNormaleBayes"
  | "loiPoisson";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64-70), mais énoncé/
 * justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizVariablesAleatoires {
  variante: VarianteQuizVariablesAleatoires;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizVariablesAleatoires = () => ExerciceQuizVariablesAleatoires;
