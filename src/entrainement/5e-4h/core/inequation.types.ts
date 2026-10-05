/**
 * Couche core — contrat propre à l'exercice "tableau de signes" (inéquations du 2nd degré).
 * Indépendant de src/core/generateur.types.ts (spécifique à l'exercice "méthode la plus rapide") :
 * cet exercice a un énoncé (ax²+bx+c ◇ 0) et une notion de solution (ensemble construit) différents.
 */

export type Symbole = "<" | ">" | "≤" | "≥";

/** ax² + bx + c */
export interface Enonce {
  a: number;
  b: number;
  c: number;
}

/** Borne d'un intervalle : un nombre, ou l'infini (toujours associé à un crochet ouvert). */
export type Borne = number | "-inf" | "+inf";

/**
 * Notation francophone à crochets inversés (jamais de parenthèses) : à gauche, "[" = fermé et
 * "]" = ouvert ; à droite, "]" = fermé et "[" = ouvert. Le même domaine de caractères sert aux
 * deux champs — c'est la position (gauche/droite) qui donne le sens fermé/ouvert, pas le caractère.
 */
export type Crochet = "[" | "]";

export interface Morceau {
  crochetGauche: Crochet;
  borneGauche: Borne;
  crochetDroit: Crochet;
  borneDroite: Borne;
}

/**
 * Ensemble-solution d'une inéquation du 2nd degré. Sert à la fois de solution calculée par le
 * générateur (Couche A) et de structure produite par la construction guidée côté élève (section 3
 * de la spec) : la vérification (Couche B) n'a donc qu'à comparer deux valeurs de ce type.
 */
export type SolutionEnsemble =
  | { forme: "vide" }
  | { forme: "reel" }
  | { forme: "point"; valeur: number }
  | { forme: "reel_sauf_point"; valeur: number }
  | { forme: "intervalle"; morceau: Morceau }
  | { forme: "union"; morceau1: Morceau; morceau2: Morceau };

export interface ExerciceInequation {
  enonce: Enonce;
  symbole: Symbole;
  delta: number;
  /** présent seulement si delta >= 0 ; les deux valeurs sont égales si delta = 0 */
  racines?: [number, number];
  solution: SolutionEnsemble;
}

export type GenerateurExerciceInequation = () => ExerciceInequation;

/** Signe choisi/à choisir pour le coefficient a — étape "signe de a". */
export type SigneA = "+" | "-";

/**
 * Réponse guidée de l'étape "racines" : soit aucune racine réelle (Δ<0), soit deux valeurs
 * numériques (couvre aussi la racine double : l'élève saisit alors la même valeur deux fois).
 */
export type ReponseRacines = { type: "aucune" } | { type: "deux"; x1: number; x2: number };
