/**
 * Couche A (5e) — 5gen9 : "Paramètres d'une fonction sinusoïdale (lecture graphique)". Réutilise
 * DIRECTEMENT `tirerParametresBase` de 5gen8 (import générateur→générateur, explicitement autorisé
 * par l'architecture) — "mêmes gammes de valeurs" (spec).
 *
 * Écart assumé par rapport à une lecture littérale de la spec, signalé explicitement plutôt que
 * deviné silencieusement : la branche "amplitude irrationnelle" de 5gen8 (~15% des tirages,
 * A=±√k) est ici EXCLUE par un retirage — une amplitude irrationnelle rendrait structurellement
 * impossible l'exigence, elle aussi explicite dans la spec, que "tous les points clés utiles à la
 * lecture (maxima, minima, passages par la médiane) tombent sur des coordonnées EXACTEMENT
 * lisibles" : le maximum/minimum d'une courbe d'amplitude √2 ne tombe jamais sur une graduation
 * entière ni demi-entière d'un axe Y gradué simplement. Les deux exigences de la spec sont donc en
 * tension sur ce seul point ; la lecture retenue privilégie la lisibilité graphique (l'objet même de
 * ce générateur) plutôt que la reprise à l'identique du générateur algébrique (5gen8, qui n'a lui
 * aucune contrainte de lisibilité sur un axe).
 */
import type { ExerciceParametresSinusoideGraphique } from "../../core5e/parametresSinusoideGraphique.types";
import { tirerParametresBase } from "../parametresSinusoide/parametres";

export function genererExerciceParametresSinusoideGraphique(): ExerciceParametresSinusoideGraphique {
  let parametres = tirerParametresBase();
  while (parametres.A.radicande !== null) parametres = tirerParametresBase();
  return parametres;
}
