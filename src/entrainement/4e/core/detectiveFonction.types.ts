/**
 * Couche core — « Détective d'erreurs : fonction du second degré » (gen127, 4e, chapitre 1 « La
 * fonction du second degré », section `revision`, processus 3 TRANSFÉRER). Même mécanique que gen121
 * (4e ch. 2) : un élève fictif a traité une question du chapitre en 4 ou 5 lignes numérotées ; UNE
 * SEULE ligne est fausse et la suite de la copie en découle. L'élève trouve la ligne, nomme l'erreur,
 * puis donne le résultat correct.
 *
 * VARIANTE = exercice support (jamais le type d'erreur) ; dans chaque variante, le type d'erreur (et
 * donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable, avec les MÊMES contraintes sur
 * les données pour les deux types (aucun détail des nombres ne trahit le verdict) :
 * - sommet (formule x_S = −b/2a, b < 0) : bSansSigne (ligne 1) | signeXS (ligne 2) ;
 * - canonique (compléter le carré, a ≠ 1) : nonMultiplieParA (ligne 3) | signeSommet (ligne 5) ;
 * - image : allureInversee (ligne 3) | imageAvecXS (ligne 4) — x_S ≠ y_S ;
 * - optimum sur [m ; M] (sommet HORS du domaine dans les deux types) : sommetHorsDomaine (ligne 2) |
 *   variationInversee (ligne 3).
 * Aucun « Δ » ni « discriminant » (chapitre 1).
 */

export type VarianteDetectiveFonction = "sommet" | "canonique" | "image" | "optimum";

export type TypeErreurFonction =
  /** b recopié sans son signe (b = 12 au lieu de −12). */
  | "bSansSigne"
  /** Le « − » de x_S = −b/(2a) oublié. */
  | "signeXS"
  /** Le −p² sorti du crochet n'est pas multiplié par a. */
  | "nonMultiplieParA"
  /** (x − 3)² lu S(−3 ; …) : signe de x_S inversé à la lecture. */
  | "signeSommet"
  /** a < 0 lu « tournée vers le haut » (ou l'inverse). */
  | "allureInversee"
  /** Image écrite avec x_S au lieu de y_S. */
  | "imageAvecXS"
  /** Optimum pris au sommet sans vérifier qu'il est dans le domaine. */
  | "sommetHorsDomaine"
  /** Sens de variation inversé : extremum pris à la borne la plus éloignée du sommet. */
  | "variationInversee";

export type IdDescriptionFonction = TypeErreurFonction | "leurreCarreNegatif" | "leurreCoordInversees" | "leurreEvidence" | "leurreCompletion" | "leurreAllure";

export interface ExerciceDetectiveFonction {
  variante: VarianteDetectiveFonction;
  type: TypeErreurFonction;
  /** f(x) = ax² + bx + c = a(x − h)² + k (entiers). */
  a: number;
  b: number;
  c: number;
  h: number;
  k: number;
  /** Domaine [m ; M] (variante `optimum` seulement). */
  m: number | null;
  M: number | null;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération). */
  options: IdDescriptionFonction[];
}
