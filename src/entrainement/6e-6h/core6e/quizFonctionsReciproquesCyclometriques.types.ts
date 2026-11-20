/**
 * Contrat — "Fonctions réciproques et cyclométriques" (quiz vrai/faux), 6gen64, chapitre 1 du
 * chantier 6e (6h), porté de plateforme-maths (lot F de l'audit du chapitre). Banque de 245
 * affirmations vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 7 thèmes de 35 questions,
 * dans l'ordre des sections du cours — contrat indépendant de 6gen65 et des autres quiz (même
 * forme, jamais partagé).
 *
 * Thèmes : injectivité et réciproque (§ 1), arcsin / arccos / arctan (§ 2), compositions
 * arc∘trig et trig∘arc (§ 2, ajouté au portage), équations (§ 3), dérivées (§ 4), graphes et
 * transformées (§ 5), étude de fonction (§ 6, ajouté au portage).
 *
 * Contrairement à la version plateforme-maths (texte brut), `enonce`/`justification` sont des
 * `FragmentConsigne[]` (texte/LaTeX mêlés, rendus en KaTeX par `src/components/RenduFragments.tsx`),
 * comme 6gen65.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizFonctionsReciproquesCyclometriques =
  | "injectiviteSurjectiviteBijectivite"
  | "fonctionsCyclometriques"
  | "compositionsArcTrig"
  | "equationsCyclometriques"
  | "deriveesCyclometriques"
  | "graphiquesCyclometriques"
  | "etudeFonctionCyclometrique";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizFonctionsReciproquesCyclometriques {
  variante: VarianteQuizFonctionsReciproquesCyclometriques;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizFonctionsReciproquesCyclometriques = () => ExerciceQuizFonctionsReciproquesCyclometriques;
