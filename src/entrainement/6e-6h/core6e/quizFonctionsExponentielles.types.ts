/**
 * Contrat — "Fonctions exponentielles" (quiz vrai/faux), 6gen65, ajout ultérieur au chapitre 2 du
 * chantier 6e (6h) déjà complet (6gen6-12). Même principe que 6gen64 (`quizFonctionsReciproquesCyclometriques`,
 * chapitre 1) et les 4 quiz vrai/faux du chantier 4e (gen59-62) — banque de 245 affirmations
 * vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 7 thèmes de 35 questions chacun — mais
 * contrat entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64 (voir CLAUDE.md,
 * "3 chantiers indépendants").
 *
 * Les 7 thèmes reprennent exactement les 7 générateurs déjà établis du chapitre 2 : calcul de
 * limites (6gen6), domaine et dérivée (6gen7), graphique de la dérivée (6gen8), équations (6gen9),
 * inéquations (6gen10), étude complète de fonction (6gen11), problèmes (6gen12).
 *
 * SEULE différence réelle avec 6gen64 : `enonce`/`justification` sont ici des `FragmentConsigne[]`
 * (texte/LaTeX mêlés), pas de simples `string` — les affirmations de ce chapitre contiennent
 * beaucoup plus de notation mathématique explicite (limites, dérivées, exposants, inéquations) qui
 * doit être rendue en KaTeX plutôt qu'en caractères texte bruts (`a^x`, `e^(-x)`...). Motif
 * `FragmentConsigne`/`texte`/`latex` déjà établi ailleurs sur la plateforme (copie locale
 * volontaire, jamais un import cross-chantier — voir `src/ui/formatEquationDroite.ts` pour la
 * définition originale, structurellement identique) ; rendu via le composant PARTAGÉ chantier-
 * agnostique `src/components/RenduFragments.tsx` (même tier que `src/components/Katex.tsx`).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizFonctionsExponentielles =
  | "limitesExponentielles"
  | "domaineDeriveeExponentielles"
  | "graphiquesDeriveeExponentielles"
  | "equationsExponentielles"
  | "inequationsExponentielles"
  | "etudeFonctionExponentielle"
  | "exponentiellesProblemes";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64 et les 4 quiz vrai/faux
 * 4e), mais énoncé/justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizFonctionsExponentielles {
  variante: VarianteQuizFonctionsExponentielles;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizFonctionsExponentielles = () => ExerciceQuizFonctionsExponentielles;
