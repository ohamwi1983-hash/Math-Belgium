/**
 * Couche core — « Aire d'un triangle quelconque » (gen75, 4e, chapitre 5, section « triangle »,
 * processus 2 APPLIQUER). Formule du cours : Aire = ½·a·b·sin Ĉ (deux côtés et l'angle COMPRIS
 * entre eux) ; « pour aller plus loin » : la formule de Héron.
 *
 * Cinq familles (une par variante du catalogue) :
 * - `aire` : deux côtés et l'angle compris → l'aire ;
 * - `angle` : deux côtés et l'aire → l'angle compris, qui a DEUX amplitudes possibles (X̂ et son
 *   supplémentaire, même sinus), sauf X̂ = 90° ;
 * - `cote` : un côté, l'angle compris et l'aire → l'autre côté ;
 * - `quadrilatere` : quadrilatère convexe ABCD découpé par la diagonale [AC] — la diagonale se
 *   calcule d'abord (Al-Kashi dans ABC), puis l'aire de ACD, et on additionne ;
 * - `heron` : trois côtés → demi-périmètre → aire.
 *
 * Angles en DEGRÉS (convention du chapitre). Longueurs entières, sauf l'inconnue.
 */

export type FamilleAireTriangle = "aire" | "angle" | "cote" | "quadrilatere" | "heron";

export type SommetTriangle = "A" | "B" | "C";

export type UniteAire = "mm" | "cm" | "dm" | "m";

/** Nombre exact (n / d)·√r, r ∈ {1, 2, 3} — aire donnée ou attendue en valeur exacte. */
export interface NombreRadical {
  n: number;
  d: number;
  r: 1 | 2 | 3;
}

/** Aire donnée dans l'énoncé (familles `angle` et `cote`) : `valeur` sert à TOUS les calculs ;
 * `exacte` présente quand l'aire est donnée en valeur exacte (angle remarquable), sinon la valeur
 * est un décimal au dixième. */
export interface AireDonnee {
  valeur: number;
  exacte: NombreRadical | null;
}

interface Commun {
  unite: UniteAire;
  /** Ordre d'affichage des options des écrans à choix fermé (permutation de 0..3), tiré à la
   * génération pour que `?code=` rouvre exactement le même écran. */
  ordreOptions: number[];
}

/** Familles « un triangle, un angle compris » : le sommet X de l'angle, ses deux côtés [XY] et
 * [XZ] (Y < Z dans l'ordre alphabétique). */
export interface DonneesAngleCompris {
  sommet: SommetTriangle;
  /** |XY| */
  cote1: number;
  /** |XZ| — inconnue de la famille `cote` (valeur d'origine, avant arrondi de l'aire). */
  cote2: number;
  /** Amplitude de X̂ en degrés — inconnue de la famille `angle` (valeur aiguë d'origine). */
  angle: number;
}

export type ExerciceAireTriangleSinus =
  | (Commun & DonneesAngleCompris & { famille: "aire" })
  | (Commun & DonneesAngleCompris & { famille: "angle"; aire: AireDonnee })
  | (Commun & DonneesAngleCompris & { famille: "cote"; aire: AireDonnee })
  | (Commun & {
      famille: "quadrilatere";
      AB: number;
      BC: number;
      /** Amplitude de l'angle ABC (degrés). */
      angleB: number;
      CD: number;
      /** Amplitude de l'angle ACD (degrés). */
      angleACD: number;
    })
  | (Commun & {
      famille: "heron";
      /** BC, AC, AB (côtés opposés à A, B, C). */
      a: number;
      b: number;
      c: number;
    });
