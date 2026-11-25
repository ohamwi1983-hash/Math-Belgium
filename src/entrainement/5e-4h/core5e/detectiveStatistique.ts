import type { Point2 } from "./statistiqueLotH2";

/**
 * Couche core — `5gen81` « Détective d'erreurs : statistique à deux variables » (5e ch. 6, fin du
 * chapitre, processus 3 TRANSFÉRER). Même mécanique que 5gen49 / 5gen58 / 5gen72 / 6gen131 : un élève
 * fictif a résolu un exercice du chapitre en lignes numérotées ; UNE ligne est fausse et la suite en
 * découle. Trois écrans : la ligne fausse (choix fermé), l'erreur (quatre descriptions, choix fermé),
 * la correction (champ(s) pour une erreur de calcul, choix fermé pour une erreur d'interprétation).
 *
 * VARIANTE = TYPE D'ERREUR (le nom dit la réponse de l'écran 2 : groupe à verdict `groupe_erreur`) :
 * Mayer sans tri, pente arrondie avant de calculer b, médianes au lieu des moyennes pour G, x̄ et ȳ
 * échangés dans b, écarts-types en divisant par n − 1 (Sx au lieu de σx), covariance sans diviser par n
 * (r > 1), extrapolation abusive, « donc x cause y ». « Quelle ligne ? » est aussi un verdict : 0 à 3
 * lignes justes précèdent la ligne fausse, tiré EN DERNIER (`av`), jamais dans `forme`.
 */

export type VarianteDetectiveStat =
  | "mayerSansTri"
  | "penteArrondie"
  | "medianeMoyenne"
  | "xyEchanges"
  | "sxAuLieuSigma"
  | "covSansN"
  | "extrapolation"
  | "causalite";

export const VARIANTES_CALCUL: VarianteDetectiveStat[] = ["mayerSansTri", "penteArrondie", "medianeMoyenne", "xyEchanges", "sxAuLieuSigma", "covSansN"];
export const VARIANTES_INTERPRETATION: VarianteDetectiveStat[] = ["extrapolation", "causalite"];

export interface ExerciceDetectiveStat {
  variante: VarianteDetectiveStat;
  /** Points dans l'ordre du TABLEAU de l'énoncé (Mayer sans tri : désordre). */
  points: Point2[];
  /** Pente arrondie : G₁, G₂ et la pente arrondie de la copie. */
  g1?: Point2;
  g2?: Point2;
  aArrondi?: number;
  /** Extrapolation / causalité : indice du contexte ; extrapolation : abscisse lointaine. */
  contexte?: number;
  xLoin?: number;
  /** Lignes justes avant la ligne fausse (0 à 3), tiré en dernier. */
  av: number;
  /** Ordre des quatre descriptions de l'écran 2 (identifiants). */
  options: string[];
  /** Ordre des quatre conclusions de l'écran 3 (interprétation) : 0 = la bonne. */
  ordreCorrection: number[];
}

export const estInterpretation = (e: ExerciceDetectiveStat): boolean => VARIANTES_INTERPRETATION.includes(e.variante);
