/**
 * Géométrie pure du graphe Mafs de "Équation d'un cercle (non développée) à partir d'un graphe" —
 * cadrage dérivé des 4 points cardinaux du cercle (centre±rayon sur chaque axe), jamais un domaine
 * fixe indépendant du cercle réellement tracé. Réutilise `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`,
 * module frère déjà partagé par le chapitre "Calcul vectoriel") — X et Y sont homogènes pour un
 * cercle (les deux représentent la même échelle spatiale), jamais besoin de
 * `preserveAspectRatio={false}` (contrairement à la classe de bug documentée pour le chapitre
 * "Statistiques", où X et Y sont deux grandeurs sans rapport).
 */
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

/** Les 4 points cardinaux du cercle (centre±rayon sur chaque axe) — jamais stockés sur le contrat,
 * une pure dérivation présentationnelle pour le cadrage du graphe. */
export function pointsCardinauxCercle(exercice: ExerciceEquationCercle): Point[] {
  const { centre, rayon } = exercice;
  return [
    { x: centre.x + rayon, y: centre.y },
    { x: centre.x - rayon, y: centre.y },
    { x: centre.x, y: centre.y + rayon },
    { x: centre.x, y: centre.y - rayon },
  ];
}

/** Cadrage du graphe — couvre le cercle entier (4 points cardinaux) ET le point marqué, recalculé
 * explicitement plutôt que de dépendre de la coïncidence que ce dernier soit déjà sur le cercle. */
export function viewBoxEquationCercle(exercice: ExerciceEquationCercle): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = [...pointsCardinauxCercle(exercice), exercice.pointMarque].map((point) => ({ point, label: "" }));
  return calculerViewBoxVecteurs(affiches);
}
