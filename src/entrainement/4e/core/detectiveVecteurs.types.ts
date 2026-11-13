import type { FragmentConsigne } from "../../export/genererFeuilleExercices";

/**
 * Couche core — « Le détective d'erreurs vectoriel » (gen91, 4e, chapitre 6 « Calcul vectoriel »,
 * section « revision », processus 3 TRANSFÉRER). Sur le modèle de gen81 (chapitre 5).
 *
 * Un élève fictif a résolu un exercice de calcul vectoriel (4 ou 5 lignes numérotées). UNE SEULE
 * ligne est fausse, et tout ce qui suit en découle (la copie reste cohérente avec son erreur, y
 * compris quand le verdict final s'inverse). L'élève trouve la ligne, nomme l'erreur, puis corrige
 * la valeur de la ligne et la conclusion.
 *
 * Notation du cours : `\vec{AB}`, composantes en colonne, points `A(x\,;\,y)`, norme `\|\vec{u}\|`,
 * colinéarité x_u·y_v − y_u·x_v = 0, orthogonalité x_u·x_v + y_u·y_v = 0, parallélogramme
 * ABCD ⟺ \vec{AB} = \vec{DC}.
 */

/** Les six types d'erreur du catalogue (une variante chacun). */
export type TypeErreurVecteurs = "sens" | "chasles" | "norme" | "colinearite" | "orthogonalite" | "parallelogramme";

/** Exercice support que la copie résout. */
export type SupportVecteurs = "relation" | "chasles" | "isocele" | "alignement" | "rectangle" | "parallelogramme" | "milieu";

/**
 * Scénario = type d'erreur + exercice support + ligne fausse (même étape d'une série à l'autre) :
 * - S1 : point M tel que AM = AB + k·AC, AB calculé « A − B » (ligne 1/5) ;
 * - S2 : même support, AC calculé « A − C » (ligne 2/5) ;
 * - S3 : quatrième sommet D du parallélogramme, AB calculé « A − B » (ligne 2/5) ;
 * - C1 : point M tel que DM = (expression réduite par Chasles), réduction fausse (ligne 1/4) ;
 * - N1 : triangle isocèle en A ?, norme AB fausse (ligne 2/5) ;
 * - N2 : même support, norme AC fausse (ligne 4/5) ;
 * - K1 : alignement de A, B, C, critère de colinéarité faux (ligne 3/4) ;
 * - O1 : triangle rectangle en A ?, produit scalaire faux (ligne 3/4) ;
 * - P1 : quatrième sommet D, AB = CD au lieu de AB = DC (ligne 1/5) ;
 * - P2 : quatrième sommet D par les diagonales, milieu calculé par une différence (ligne 2/4).
 */
export type IdScenarioVecteurs = "S1" | "S2" | "S3" | "C1" | "N1" | "N2" | "K1" | "O1" | "P1" | "P2";

/**
 * Sous-variante du défaut : Chasles → « difference » (AB − AC = BC) ou « enchainement »
 * (BA + CB = AC) ; norme → « racine » (racine oubliée) ou « carre » ((−3)² = −9) ; colinéarité →
 * « signe » (x_u y_v + y_u x_v) ou « rapports » (x₁/x₂ comparé à y₂/y₁) ; orthogonalité →
 * « formule » (x_u x_v − y_u y_v) ou « produit » (produit de deux négatifs compté négatif) ;
 * sinon `null`.
 */
export type SousVarianteVecteurs = "difference" | "enchainement" | "racine" | "carre" | "signe" | "rapports" | "formule" | "produit" | null;

/** Descriptions d'erreur proposées à l'écran 2 (la bonne + 3 leurres). */
export type IdDescriptionVecteurs =
  | "sens"
  | "chaslesDifference"
  | "chaslesEnchainement"
  | "racine"
  | "carre"
  | "detSigne"
  | "rapports"
  | "scalaireSigne"
  | "produitSigne"
  | "parallelogrammeCD"
  | "milieu"
  // leurres
  | "milieuVecteur"
  | "chaslesSuivi"
  | "translationSigne"
  | "normeSomme"
  | "pythagoreIsocele"
  | "confondOrthogonalite"
  | "confondColinearite"
  | "conditionNorme"
  | "parallelogrammeAD"
  | "milieuDiagonales"
  | "milieuDouble";

export interface Point {
  x: number;
  y: number;
}

/** Données entières de l'exercice (D seulement pour le support « chasles », k pour « relation »). */
export interface DonneesVecteurs {
  A: Point;
  B: Point;
  C: Point;
  D?: Point;
  k?: number;
}

export interface ExerciceDetectiveVecteurs {
  scenario: IdScenarioVecteurs;
  donnees: DonneesVecteurs;
  sousVariante: SousVarianteVecteurs;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionVecteurs[];
}

/** Valeur portée par une ligne (ce que l'écran 3 demande de corriger). */
export type ValeurLigne =
  | { genre: "nombre"; quantite: string; valeur: number; latex: string }
  | { genre: "vecteur"; quantite: string; x: number; y: number }
  | { genre: "point"; nom: string; x: number; y: number }
  | { genre: "verdict"; vrai: boolean; libelleVrai: string; libelleFaux: string };

/** Une ligne de la copie (ou de la résolution correcte). */
export interface LigneCopie {
  fragments: FragmentConsigne[];
  /** Valeur calculée sur la ligne, ou `null` (ligne de traduction, d'équations, de rappel). */
  valeur: ValeurLigne | null;
  /** Formule de la ligne avec les nombres, SANS le résultat (aide de l'écran 3), ou `null`. */
  formule: string | null;
}
