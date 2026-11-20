/**
 * Couche core — `6gen155` « Dérivée d'une réciproque en un point » (6e ch. 1, § 1, processus 2
 * APPLIQUER). f est continue et strictement croissante sur I (admis), sans expression exploitable de
 * f⁻¹ ; on veut (f⁻¹)′(y₀). Quatre écrans :
 * 1. x₀ = f⁻¹(y₀) par une valeur évidente (champ, trois tentatives) ;
 * 2. f′(x₀) (champ, trois tentatives) ;
 * 3. le théorème s'applique-t-il ? (choix fermé, une tentative : verdict f′(x₀) ≠ 0 / = 0, tiré
 *    50/50 dans chaque famille) ;
 * 4. (f⁻¹)′(y₀) = 1/f′(x₀) (champ) — absent quand f′(x₀) = 0 (structure fixe de quatre puces).
 *
 * Familles (= variantes, aucune ne donne le verdict) : polynôme x³ − 3hx² + (3h² + p)x + q,
 * exponentielle eˣ + kx + c, logarithme ln x + kx + c ou x − ln x + c, trigonométrique kx ± sin x
 * (± cos x) + c, arctangente kx ± arctan x + c.
 */

export type FamilleReciproque = "poly" | "exp" | "ln" | "trig" | "arctan";

export interface ExerciceDeriveeReciproque {
  variante: FamilleReciproque;
  /** Paramètres entiers de la famille (noms propres à chaque famille, voir le modèle). */
  p: Record<string, number>;
  /** Indice de x₀ dans la liste des valeurs évidentes de la famille. */
  ix0: number;
}
