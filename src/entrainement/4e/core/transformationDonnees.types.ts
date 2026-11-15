/**
 * Couche core — « Effet d'une transformation des données » (gen108, 4e, chapitre 4 « Statistique
 * descriptive », sections « moyenne » / « dispersion », processus 3 TRANSFÉRER).
 *
 * Une série dont les indicateurs sont DÉJÀ calculés (moyenne, médiane, étendue, variance,
 * écart-type) subit une même transformation sur chaque valeur, décrite avec les mots du contexte :
 * ajouter une constante (prime, bonus, correction d'un thermomètre), multiplier (hausse en %,
 * changement d'unité), ou les deux (°C → °F, conversion puis frais, points manquants). L'élève
 * l'écrit sous la forme y = a·x + b, puis en déduit les nouveaux indicateurs SANS recalculer la
 * série : moyenne et médiane → a·x + b ; étendue et écart-type → |a|·… ; variance → a²·….
 */

/** Variante du catalogue = nature de la transformation. */
export type TypeTransformation = "constante" | "multiplication" | "affine";

/**
 * Signature de difficulté (profil d'évaluation `forme`) :
 * - `constante` : y = x + b ;
 * - `pourcentage` : y = a·x, a tiré d'une hausse / baisse en % (a = 1 ± t/100 à calculer) ;
 * - `facteur` : y = a·x, changement d'unité ou d'échelle (a donné par la conversion) ;
 * - `direct` : y = a·x + b, « on multiplie par a, puis on ajoute b » ;
 * - `avant` : la constante c est ajoutée AVANT la multiplication — y = a·(x + c), donc b = a·c ;
 * - `negatif` : y = b − x (a = −1 : points manquants, temps restant).
 */
export type FormeTransformation = "constante" | "pourcentage" | "facteur" | "direct" | "avant" | "negatif";

export interface IndicateursSerie {
  moyenne: number;
  mediane: number;
  etendue: number;
  variance: number;
  ecartType: number;
}

export interface ExerciceTransformationDonnees {
  type: TypeTransformation;
  forme: FormeTransformation;
  /** Identifiant du contexte (`CONTEXTES` de `ui/formatTransformationDonnees.ts`). */
  contexte: string;
  /** Effectif de la série (seulement pour le récit). */
  n: number;
  /** Coefficients de y = a·x + b. */
  a: number;
  b: number;
  /** Pourcentage de hausse (> 0) ou de baisse (< 0) quand a en provient, sinon `null`. */
  pourcentage: number | null;
  /** Forme `avant` (et salaires « hausse puis prime ») : la constante telle que le récit la donne. */
  constante: number | null;
  /** Indicateurs de la série de départ (x) — donnés. */
  depart: IndicateursSerie;
  /** Indicateurs de la nouvelle série (y) — attendus. */
  arrivee: IndicateursSerie;
  /** Ordre d'affichage des quatre phrases de conclusion (écran 4). */
  ordrePhrases: number[];
}
