/**
 * Contrat — "Nombres complexes" (quiz vrai/faux), 6gen68, ajout ultérieur au chapitre 7 du
 * chantier 6e (6h) déjà complet (6gen34-42). Même principe que 6gen64 (chapitre 1), 6gen65
 * (chapitre 2), 6gen66 (chapitre 3) et 6gen67 (chapitre 4) — banque de 315 affirmations vrai/faux
 * PRÉ-ÉCRITES (jamais générées procéduralement), 9 thèmes de 35 questions chacun — mais contrat
 * entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64/65/66/67 (voir CLAUDE.md,
 * "3 chantiers indépendants").
 *
 * Les 9 thèmes reprennent exactement les 9 générateurs déjà établis du chapitre 7 : opérations de
 * base et puissances de i (6gen34), affixes et racines carrées (6gen35), équations dans ℂ (6gen36),
 * forme trigonométrique/module/argument (6gen37), formule de Moivre (6gen38), racines n-ièmes
 * (6gen39), transformations du plan (6gen40), propriétés géométriques de triangles (6gen41),
 * problèmes avancés (6gen42).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65/66/67 —
 * pas de simples `string` — la densité de notation mathématique de ce chapitre (i, affixes, module/
 * argument, exposants, racines n-ièmes) l'exige au moins autant que les chapitres 2/3/4. Motif
 * `FragmentConsigne`/`texte`/`latex` copié localement (jamais un import cross-fichier d'un autre
 * chantier ou d'un autre quiz — voir `core6e/quizIntegralesPrimitives.types.ts` pour la structure
 * identique).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizNombresComplexes =
  | "operationsBase"
  | "affixesRacines"
  | "equationsComplexes"
  | "formeTrigonometrique"
  | "formuleMoivre"
  | "racinesNiemes"
  | "transformationsPlan"
  | "trianglesComplexes"
  | "complexesAvances";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64/65/66/67), mais
 * énoncé/justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizNombresComplexes {
  variante: VarianteQuizNombresComplexes;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizNombresComplexes = () => ExerciceQuizNombresComplexes;
