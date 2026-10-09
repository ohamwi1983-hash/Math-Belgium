/**
 * Contrat — "Probabilités" (quiz vrai/faux), 6gen69, ajout ultérieur au chapitre 8 du chantier 6e
 * (6h) déjà complet (6gen30-33). Même principe que 6gen64 (chapitre 1), 6gen65 (chapitre 2),
 * 6gen66 (chapitre 3), 6gen67 (chapitre 4) et 6gen68 (chapitre 7) — banque de 140 affirmations
 * vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 4 thèmes de 35 questions chacun — mais
 * contrat entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64/65/66/67/68 (voir
 * CLAUDE.md, "3 chantiers indépendants").
 *
 * Les 4 thèmes reprennent exactement les 4 générateurs déjà établis du chapitre 8 : inclusion-
 * exclusion/tableau à double entrée/cartes et dés (6gen30), tirages avec/sans remise et
 * dénombrement (6gen31), indépendance/conditionnement/Bayes (6gen32), problèmes variés (6gen33).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65/66/67/68
 * — pas de simples `string` — la densité de notation mathématique de ce chapitre (fractions,
 * probabilités conditionnelles P(A|B), unions/intersections, formules combinatoires) l'exige au
 * moins autant que les chapitres précédents. Motif `FragmentConsigne`/`texte`/`latex` copié
 * localement (jamais un import cross-fichier d'un autre chantier ou d'un autre quiz).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizProbabilites = "probabilitesEnsembles" | "tiragesArbres" | "independanceBayes" | "probabilitesProblemes";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64/65/66/67/68), mais
 * énoncé/justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizProbabilites {
  variante: VarianteQuizProbabilites;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizProbabilites = () => ExerciceQuizProbabilites;
