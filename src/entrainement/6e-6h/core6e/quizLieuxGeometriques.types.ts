/**
 * Contrat — "Lieux géométriques" (quiz vrai/faux), 6gen72, ajout ultérieur au chapitre "Lieux
 * géométriques" du chantier 6e (6h) déjà complet (6gen54-57). Même principe que 6gen64 (chapitre
 * 1), 6gen65 (chapitre 2), 6gen66 (chapitre 3), 6gen67 (chapitre 4), 6gen68 (chapitre 7), 6gen69
 * (chapitre 8), 6gen70 (chapitre 9) et 6gen71 (chapitre 10) — banque de 140 affirmations vrai/faux
 * PRÉ-ÉCRITES (jamais générées procéduralement), 4 thèmes de 35 questions chacun — mais contrat
 * entièrement indépendant, jamais partagé entre chantiers ni avec 6gen64/65/66/67/68/69/70/71 (voir
 * CLAUDE.md, "3 chantiers indépendants").
 *
 * Les 4 thèmes reprennent exactement les 4 générateurs déjà établis du chapitre "Lieux
 * géométriques" : points et droites remarquables du triangle (6gen54), cercles (6gen55), lieux
 * géométriques et élimination de paramètre (6gen56), problèmes de lieux — méthode des génératrices
 * (6gen57).
 *
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés), comme 6gen65-71 — pas
 * de simples `string` — la densité de notation mathématique de ce chapitre (équations implicites
 * `ax+by+c=0`, forme générale d'un cercle `x^2+y^2+Dx+Ey+F=0`, valeurs absolues, seuils, fractions,
 * racines) l'exige au moins autant que les chapitres précédents. Motif `FragmentConsigne`/`texte`/
 * `latex` copié localement (jamais un import cross-fichier d'un autre chantier ou d'un autre quiz).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export type VarianteQuizLieuxGeometriques =
  | "pointsDroitesRemarquablesTriangle"
  | "cercles"
  | "lieuxGeometriquesParametres"
  | "methodeGeneratrices";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées (même contrat que 6gen64-71), mais énoncé/
 * justification en fragments texte/LaTeX plutôt qu'en `string` brute. */
export interface QuestionVraiFaux {
  enonce: FragmentConsigne[];
  reponse: boolean;
  justification: FragmentConsigne[];
}

export interface ExerciceQuizLieuxGeometriques {
  variante: VarianteQuizLieuxGeometriques;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizLieuxGeometriques = () => ExerciceQuizLieuxGeometriques;
