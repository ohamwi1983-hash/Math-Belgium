/**
 * gen99 « Détective d'erreurs : géométrie analytique » (4e, ch. 7, § 11 « Révision »). Même mécanique
 * que gen127 / gen121 / gen112 : une copie d'élève numérotée contient UNE ligne fausse (la suite en
 * découle). VARIANTE = exercice support (décision de la fiche, leçon de 5gen49) ; dans chaque support,
 * le TYPE D'ERREUR est tiré à pile ou face AVANT les nombres, et `av` (0 à 3 lignes justes avant la
 * ligne fausse) uniformément : « quelle ligne ? » et « quelle erreur ? » sont des verdicts équilibrés.
 */

export type SupportDetective = "droite" | "perpendiculaire" | "pente" | "cercle" | "parabole" | "distance";

export type TypeErreurAnalytique =
  | "normalDirecteur"
  | "signeC"
  | "perpNormal"
  | "perpEchange"
  | "penteInversee"
  | "ordonneeOrigine"
  | "signeCentre"
  | "rCarre"
  | "pAuLieuDemi"
  | "signeDirectrice"
  | "formeNonRamenee"
  | "carreNegatif";

/** Descriptions proposées à l'écran 2 : les types d'erreur et des leurres (toujours faux). */
export type IdDescriptionAnalytique = TypeErreurAnalytique | "leurreCoordonnees" | "leurreEchange" | "leurrePoint" | "leurreMelange" | "leurreCompletion" | "leurrePasCercle" | "leurre2p" | "leurreSommet" | "leurreDirecteurDistance" | "leurrePied";

export interface ExerciceDetectiveAnalytique {
  support: SupportDetective;
  type: TypeErreurAnalytique;
  /** Paramètres entiers du support (voir le générateur). */
  d: Record<string, number>;
  /** Nombre de lignes justes avant la ligne fausse (0 à 3). */
  av: number;
  /** Ordre des quatre descriptions de l'écran 2. */
  options: IdDescriptionAnalytique[];
}
