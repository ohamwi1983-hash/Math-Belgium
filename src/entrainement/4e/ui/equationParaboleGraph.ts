/**
 * Géométrie pure du graphe Mafs de "Équation d'une parabole depuis un graphe" — cadrage dérivé de
 * S, F et des 2 points du "latus rectum" (la corde focale, perpendiculaire à l'axe, passant par le
 * foyer — toujours à distance exacte `|p|` de l'axe), jamais un domaine fixe indépendant de la
 * parabole réellement tracée. Réutilise `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`, module
 * frère déjà partagé par le chapitre "Calcul vectoriel" et par "Équation d'un cercle... à partir
 * d'un graphe") — X et Y homogènes (même échelle spatiale), jamais besoin de
 * `preserveAspectRatio={false}`.
 */
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

/** Les 2 points du latus rectum (corde focale) — jamais stockés sur le contrat, une pure
 * dérivation présentationnelle pour le cadrage du graphe : au niveau du foyer, décalés de ±p le
 * long de l'axe perpendiculaire à l'axe de la parabole. */
export function pointsLatusRectum(exercice: ExerciceEquationParabole): Point[] {
  const { foyer, p } = exercice;
  return exercice.variante === "vertical"
    ? [
        { x: foyer.x + p, y: foyer.y },
        { x: foyer.x - p, y: foyer.y },
      ]
    : [
        { x: foyer.x, y: foyer.y + p },
        { x: foyer.x, y: foyer.y - p },
      ];
}

/** Valeur constante de la directrice — droite horizontale `y=...` (axe vertical) ou verticale
 * `x=...` (axe horizontal), symétrique du foyer F par rapport au sommet S le long de l'axe. Jamais
 * stockée sur le contrat (pure dérivation présentationnelle, même principe que `pointsLatusRectum`
 * ci-dessus) — même formule que `directrice` du générateur symétrique en sens inverse
 * (`core/equationParaboleDeveloppee.types.ts`), `promptgen51modificationscompletes.md`, partie B.1. */
export function directriceEquationParabole(exercice: ExerciceEquationParabole): number {
  const { sommet, foyer, variante } = exercice;
  return variante === "vertical" ? 2 * sommet.y - foyer.y : 2 * sommet.x - foyer.x;
}

/** Point de la directrice le plus proche du foyer (même abscisse pour l'axe vertical, même
 * ordonnée pour l'axe horizontal) — origine du vecteur illustratif "directrice → foyer" (aide 1 de
 * l'écran "Équation", partie C.2) : la longueur SIGNÉE de ce vecteur le long de l'axe vaut
 * exactement `p` (ni `p/2` ni `2p`). */
export function pointDirectriceProcheFoyer(exercice: ExerciceEquationParabole): Point {
  const { foyer, variante } = exercice;
  const d = directriceEquationParabole(exercice);
  return variante === "vertical" ? { x: foyer.x, y: d } : { x: d, y: foyer.y };
}

/** Cadrage du graphe — couvre S, F, les 2 points du latus rectum ET le point de la directrice le
 * plus proche du foyer (sans lequel la directrice, symétrique de F par rapport à S, tomberait hors
 * cadre — S et F seuls ne suffisent pas à la garantir visible). */
export function viewBoxEquationParabole(exercice: ExerciceEquationParabole): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = [exercice.sommet, exercice.foyer, ...pointsLatusRectum(exercice), pointDirectriceProcheFoyer(exercice)].map((point) => ({
    point,
    label: "",
  }));
  return calculerViewBoxVecteurs(affiches);
}
