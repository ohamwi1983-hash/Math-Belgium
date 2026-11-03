/**
 * Contrat — "Fonctions logarithmes" (quiz vrai/faux), 6gen66, ajout ultérieur au chapitre 3 du
 * chantier 6e (6h) déjà complet (6gen13-22). Même principe que 6gen65 (`quizFonctionsExponentielles`,
 * chapitre 2) et 6gen64 (`quizFonctionsReciproquesCyclometriques`, chapitre 1) — banque de 350
 * affirmations vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 10 thèmes de 35 questions
 * chacun — mais contrat entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64/65
 * (voir CLAUDE.md, "3 chantiers indépendants").
 *
 * Les 10 thèmes reprennent exactement les 10 générateurs déjà établis du chapitre 3 : propriétés du
 * logarithme (6gen13), équations exponentielle/logarithmique (6gen14), inéquations logarithmiques
 * (6gen15), domaine/dérivée/dérivation logarithmique (6gen16), limites (6gen17), paramètres depuis
 * conditions graphiques (6gen18), sinus/cosinus hyperboliques (6gen19), graphique de la dérivée
 * (6gen20), étude complète de fonction (6gen21), problèmes (6gen22).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65 — pas de
 * simples `string` — la densité de notation mathématique de ce chapitre (logarithmes, dérivées,
 * limites, sh/ch) l'exige. Motif `FragmentConsigne`/`texte`/`latex` copié localement (jamais un
 * import cross-fichier d'un autre chantier ou d'un autre quiz — voir `core6e/
 * quizFonctionsExponentielles.types.ts` pour la structure identique).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizFonctionsLogarithmes =
  | "proprietesLogarithme"
  | "equationsExpLog"
  | "inequationsLogarithme"
  | "domaineDeriveeLogarithme"
  | "limitesLogarithme"
  | "parametresGraphiques"
  | "sinusCosinusHyperboliques"
  | "graphiqueDeriveeLogarithme"
  | "etudeFonctionLogarithme"
  | "logarithmesProblemes";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64/6gen65), mais énoncé/
 * justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizFonctionsLogarithmes {
  variante: VarianteQuizFonctionsLogarithmes;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizFonctionsLogarithmes = () => ExerciceQuizFonctionsLogarithmes;
