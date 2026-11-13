/**
 * Couche core — « Valeur exacte sans calculatrice » (gen76, 4e, chapitre 5, section « associes »,
 * processus 2 APPLIQUER). Synthèse des §1 (réduire un angle, quadrant, signes — gen14), §3 (valeurs
 * remarquables — gen15) et §4 (angles associés — gen17) : l'élève calcule la valeur exacte d'une
 * expression de 2 ou 3 termes trigonométriques, par exemple sin 150° + cos 240° · tan 315°.
 *
 * Garanties (générateur) : chaque angle est un multiple de 30° ou de 45° STRICTEMENT dans un
 * quadrant (jamais sur un axe : une tangente n'est donc jamais indéfinie, et chaque terme suit la
 * même méthode — quadrant, signe, angle associé du premier quadrant, valeur remarquable) ; son
 * angle de référence vaut 30°, 45° ou 60°.
 */

export type FonctionTrig = "sin" | "cos" | "tan";

/** Quadrant strict de l'angle réduit (jamais un axe, voir la garantie ci-dessus). */
export type QuadrantStrict = "I" | "II" | "III" | "IV";

export type AngleReference = 30 | 45 | 60;

/** Opérateur placé AVANT un terme (sans objet pour le premier). Priorité usuelle : « · » d'abord. */
export type Operateur = "+" | "-" | "*";

export interface TermeTrig {
  fonction: FonctionTrig;
  /** Angle tel qu'il est écrit dans l'énoncé (peut être négatif ou ≥ 360° dans la variante
   * « grands angles »). */
  angle: number;
  /** Terme élevé au carré (cos² 135°…) — variante « avec un carré » seulement. */
  carre: boolean;
}

export type VarianteValeurExacte = "deux-termes" | "trois-termes" | "grands-angles" | "carre";

export interface ExerciceValeurExacte {
  variante: VarianteValeurExacte;
  termes: TermeTrig[];
  /** `operateurs[i]` relie `termes[i]` et `termes[i + 1]` (longueur = nombre de termes − 1). */
  operateurs: Operateur[];
}
