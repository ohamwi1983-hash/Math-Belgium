/**
 * Couche core (6e) — contrat de `6gen85` « Lire une courbe logarithmique » (chapitre 3 — « Fonctions
 * logarithmes », section `parametres`, processus 2). À partir du GRAPHIQUE de
 * f(x) = log_a(x − c) + d, l'élève retrouve l'asymptote, le domaine, la base et l'expression.
 *
 * Décomposition du raisonnement (variante `lecture`, un écran par étape) :
 * 1. l'asymptote verticale : l'argument s'annule en x = c, la courbe ne franchit jamais x = c ;
 * 2. le domaine : x − c > 0, donc ]c ; +∞[ (borne exclue) ;
 * 3. la base : au point d'abscisse c + 1, l'argument vaut 1 et log_a(1) = 0, donc f(c + 1) = d ; le
 *    point de la courbe situé une unité plus haut (a > 1) ou plus bas (0 < a < 1) traduit
 *    log_a(x − c) = 1 (donc a = x − c) ou log_a(x − c) = −1 (donc a = 1/(x − c)) ;
 * 4. l'expression complète : d lu au point d'abscisse c + 1, puis assemblage (signe de c !).
 *
 * Variante `associer` : 4 courbes numérotées et 4 expressions A–D. Construction (voir le générateur) :
 * une expression de référence E1, son « miroir » E2 (sens de variation opposé, mêmes translations),
 * E3 (même sens de variation, autre base, mêmes translations) et E4 (même base qu'E1, une seule
 * translation changée) — l'élève doit donc mobiliser le sens de variation, la lecture de la base ET
 * celle des translations. Un écran (choix fermé, une seule tentative) par courbe.
 *
 * Toutes les valeurs sont exactes : a ∈ {2, 3, 4, 5, 10} ou a ∈ {1/2, 1/3, 1/4}, c et d entiers ; les
 * deux points utiles, (c + 1 ; d) et (c + k ; d ± 1) où k = a ou 1/a, ont des coordonnées entières.
 */

/** Base a = num/den, toujours un entier (den = 1) ou l'inverse d'un entier (num = 1). */
export interface BaseLog {
  num: number;
  den: number;
}

export interface CourbeLog {
  base: BaseLog;
  c: number;
  d: number;
}

export interface ExerciceLectureCourbeLog {
  variante: "lecture";
  courbe: CourbeLog;
  /** Lettres neutres du point d'abscisse c + 1 et du point qui donne la base (tirées au hasard). */
  lettrePointUn: "P" | "Q";
  lettrePointBase: "P" | "Q";
}

export interface ExerciceAssocierCourbesLog {
  variante: "associer";
  /** Expressions A, B, C, D (dans cet ordre). */
  expressions: CourbeLog[];
  /** Courbe n (n = 1…4) : indice dans `expressions` de l'expression qu'elle représente — permutation
   * tirée uniformément (position des bonnes réponses au hasard). */
  expressionDeCourbe: number[];
}

export type ExerciceLireCourbeLogarithmique = ExerciceLectureCourbeLog | ExerciceAssocierCourbesLog;

export type VarianteLireCourbeLogarithmique = ExerciceLireCourbeLogarithmique["variante"];
