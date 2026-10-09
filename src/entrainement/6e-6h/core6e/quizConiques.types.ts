/**
 * Contrat — "Les coniques" (quiz vrai/faux), 6gen73, ajout ultérieur au chapitre "Les coniques" du
 * chantier 6e (6h) déjà complet (6gen58-63). Même principe que 6gen64 (chapitre 1), 6gen65 (chapitre
 * 2), 6gen66 (chapitre 3), 6gen67 (chapitre 4), 6gen68 (chapitre 7), 6gen69 (chapitre 8), 6gen70
 * (chapitre 9), 6gen71 (chapitre 10) et 6gen72 ("Lieux géométriques") — banque de 210 affirmations
 * vrai/faux PRÉ-ÉCRITES (jamais générées procéduralement), 6 thèmes de 35 questions chacun — mais
 * contrat entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64-72 (voir CLAUDE.md,
 * "3 chantiers indépendants").
 *
 * Les 6 thèmes reprennent exactement les 6 générateurs déjà établis du chapitre "Les coniques" :
 * identification d'une conique et de ses éléments caractéristiques (6gen58), équation d'une conique
 * depuis ses caractéristiques (6gen59), aire via rayons focaux et excentricité (6gen60), intersections
 * droite-conique et conique-conique (6gen61), tangentes à une conique (6gen62), propriétés optiques
 * des coniques (6gen63).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65-72 — pas
 * de simples `string` — la densité de notation mathématique de ce chapitre (équations de coniques
 * `Ax^2+By^2+C=0`, forme standard `\frac{x^2}{a^2}+\frac{y^2}{b^2}=1`, foyers, excentricité,
 * discriminants, fractions) l'exige au moins autant que les chapitres précédents. Motif
 * `FragmentConsigne`/`texte`/`latex` copié localement (jamais un import cross-fichier d'un autre
 * chantier ou d'un autre quiz).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizConiques =
  | "identificationConiques"
  | "equationDepuisCaracteristiques"
  | "aireExcentriciteConique"
  | "intersectionsConiques"
  | "tangentesConique"
  | "proprietesOptiquesConiques";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64-72), mais énoncé/
 * justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizConiques {
  variante: VarianteQuizConiques;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizConiques = () => ExerciceQuizConiques;
