/**
 * Contrat — "Intégrales et primitives" (quiz vrai/faux), 6gen67, ajout ultérieur au chapitre 4 du
 * chantier 6e (6h) déjà complet (6gen23-29). Même principe que 6gen64 (chapitre 1), 6gen65
 * (chapitre 2) et 6gen66 (chapitre 3) — banque de 245 affirmations vrai/faux PRÉ-ÉCRITES (jamais
 * générées procéduralement), 7 thèmes de 35 questions chacun — mais contrat entièrement
 * indépendant, jamais partagé entre chantiers ni avec 6gen64/65/66 (voir CLAUDE.md, "3 chantiers
 * indépendants").
 *
 * Les 7 thèmes reprennent exactement les 7 générateurs déjà établis du chapitre 4 : calcul de
 * primitives (6gen23), quelle primitive ? condition initiale (6gen24), intégrales définies/
 * paramètre/valeur moyenne (6gen25), calcul d'aires par intégrale (6gen26), volumes de révolution
 * (6gen27), longueur d'un arc de courbe (6gen28), problèmes (6gen29).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65/6gen66
 * — pas de simples `string` — la densité de notation mathématique de ce chapitre (signes
 * d'intégrale, bornes, fractions, racines, exposants) l'exige au moins autant que les chapitres 2/3.
 * Motif `FragmentConsigne`/`texte`/`latex` copié localement (jamais un import cross-fichier d'un
 * autre chantier ou d'un autre quiz — voir `core6e/quizFonctionsLogarithmes.types.ts` pour la
 * structure identique).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizIntegralesPrimitives =
  | "calculPrimitives"
  | "quellePrimitive"
  | "integralesDefinies"
  | "calculAires"
  | "volumesRevolution"
  | "longueurArc"
  | "integralesProblemes";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64/6gen65/6gen66), mais
 * énoncé/justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizIntegralesPrimitives {
  variante: VarianteQuizIntegralesPrimitives;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizIntegralesPrimitives = () => ExerciceQuizIntegralesPrimitives;
