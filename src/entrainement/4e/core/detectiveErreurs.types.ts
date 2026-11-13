/**
 * Couche core — « Le détective d'erreurs » (gen81, 4e, chapitre 5, section « triangle »,
 * processus 3 TRANSFÉRER).
 *
 * Un élève fictif a résolu un triangle (5 ou 6 lignes numérotées). UNE SEULE ligne est fausse, et
 * tout ce qui suit en découle (la copie est cohérente avec son erreur). L'élève trouve la ligne,
 * nomme l'erreur, puis corrige la valeur de la ligne et le résultat final.
 *
 * Notation du cours : côtés a = BC, b = AC, c = AB (minuscule = côté opposé au sommet de même
 * lettre), angles Â, B̂, Ĉ en DEGRÉS.
 */

/** Les six erreurs du catalogue (une par instance). */
export type TypeErreur = "obtus" | "radians" | "arrondi" | "coteOppose" | "alKashi" | "ambigu";

/** Données du triangle : SAS (b, c, Â), SSS (a, b, c), AAS (Â, B̂, c), SSA (Â, a, b — cas ambigu). */
export type ConfigurationTriangle = "SAS" | "SSS" | "AAS" | "SSA";

/**
 * Scénario = type d'erreur + configuration + ligne fausse (même étape d'une série à l'autre) :
 * - O1 : SAS, B̂ par la loi des sinus, angle aigu au lieu de l'obtus (ligne 4/5) ;
 * - O2 : SAS (6 lignes), Ĉ par la loi des sinus, aigu au lieu de l'obtus (ligne 6/6) ;
 * - O3 : SSS, B̂ par la loi des sinus, aigu au lieu de l'obtus (ligne 4/5) ;
 * - R1 : SAS, cos Â évalué en radians dans Al-Kashi (ligne 1) ;
 * - R2 : AAS, sin Ĉ évalué en radians dans le rapport de la loi des sinus (ligne 2) ;
 * - R3 : SSS, cos⁻¹ en radians, Â lu comme des degrés (ligne 2) ;
 * - A1 : SAS, a arrondi à l'unité puis réutilisé (ligne 2) ;
 * - A2 : SAS, cos B̂ arrondi au dixième puis réutilisé (ligne 3) ;
 * - A3 : SSS, cos Â arrondi au dixième puis réutilisé (ligne 1) ;
 * - A4 : AAS, rapport c / sin Ĉ arrondi à l'unité puis réutilisé (ligne 2) ;
 * - C1 : AAS, rapport c / sin(angle non opposé) (ligne 2) ;
 * - C2 : AAS, a = rapport · sin(angle non opposé à a) (ligne 3) ;
 * - C3 : AAS, b = rapport · sin(angle non opposé à b) (ligne 4) ;
 * - K1 : SAS, Al-Kashi avec « + 2bc cos Â » ou « − bc cos Â » (ligne 1) ;
 * - K2 : SSS, Al-Kashi résolue en cosinus avec le même défaut (ligne 3) ;
 * - G1 : SSA, second angle oublié dans le cas ambigu (ligne 2).
 */
export type IdScenario = "O1" | "O2" | "O3" | "R1" | "R2" | "R3" | "A1" | "A2" | "A3" | "A4" | "C1" | "C2" | "C3" | "K1" | "K2" | "G1";

/** Sommet d'un angle. */
export type Sommet = "A" | "B" | "C";

/**
 * Sous-variante du défaut : Al-Kashi → « signe » (+ 2bc cos) ou « facteur » (2 oublié) ; côté non
 * opposé → sommet de l'angle utilisé à tort ; sinon `null`.
 */
export type SousVariante = "signe" | "facteur" | Sommet | null;

/** Descriptions d'erreur proposées à l'écran 2 (la bonne + 3 leurres). */
export type IdDescription =
  | "obtus"
  | "ambigu"
  | "radians"
  | "arrondi"
  | "coteOppose"
  | "signe"
  | "facteur"
  | "plusMoins"
  | "inverseRapport"
  | "operation"
  | "fonctionReciproque"
  | "ordreCotes";

/** Données numériques (entiers) : seules celles de la configuration sont renseignées. */
export interface DonneesTriangle {
  a?: number;
  b?: number;
  c?: number;
  A?: number;
  B?: number;
}

export interface ExerciceDetectiveErreurs {
  scenario: IdScenario;
  donnees: DonneesTriangle;
  sousVariante: SousVariante;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescription[];
}

/** Nature d'une valeur de ligne : fixe la précision demandée et la tolérance de vérification. */
export type NatureValeur = "cote" | "carre" | "angle" | "trig" | "aire" | "aucune";

/** Une ligne de la copie (ou de la résolution correcte). */
export interface LigneResolution {
  /** Texte avant la formule (« Al-Kashi : »), ou `null`. */
  prefixe: string | null;
  /** Membres LaTeX reliés par « = » (formule littérale, puis formule avec les nombres). */
  membres: string[];
  /** Relation avant le résultat (« = » si exact, « \approx » sinon). */
  relation: "=" | "\\approx";
  /** Résultat affiché (LaTeX, unité comprise), ou `null` (ligne sans résultat). */
  resultat: string | null;
  /** Texte après la formule (« : c'est le seul angle possible. »). */
  suffixe: string | null;
  /** Remplace tout l'affichage (ligne à plusieurs valeurs : conclusion, cas ambigu). */
  fragmentsLibres?: { type: "texte" | "latex"; valeur: string }[];
  /** Valeur calculée (gardée en mémoire), ou `null`. */
  valeur: number | null;
  /** Grandeur calculée (LaTeX : « a », « \hat{B} », « \cos\hat{B} »). */
  quantite: string;
  nature: NatureValeur;
}
