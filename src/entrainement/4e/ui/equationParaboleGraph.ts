/**
 * Géométrie pure du graphe Mafs de "Équation d'une parabole depuis un graphe" — cadrage dérivé de
 * S, F et de la directrice (`viewBoxEquationParabole`), jamais un domaine fixe indépendant de la
 * parabole réellement tracée. Réutilise `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`, module
 * frère déjà partagé par le chapitre "Calcul vectoriel" et par "Équation d'un cercle... à partir
 * d'un graphe") — X et Y homogènes (même échelle spatiale), jamais besoin de
 * `preserveAspectRatio={false}`.
 */
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

/** Valeur constante de la directrice — droite horizontale `y=...` (axe vertical) ou verticale
 * `x=...` (axe horizontal), symétrique du foyer F par rapport au sommet S le long de l'axe. Jamais
 * stockée sur le contrat (pure dérivation présentationnelle) — même formule que `directrice` du
 * générateur symétrique en sens inverse
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

/** Cadrage du graphe — couvre S, F et le point de la directrice le plus proche du foyer (sans
 * lequel la directrice, symétrique de F par rapport à S, tomberait hors cadre), jamais les 2 points
 * du latus rectum (corde focale, à ±p de l'axe) : les inclure élargissait le cadre jusqu'à ~28 unités, d'où
 * un quadrillage de 2 ou 5 unités où S et F d'abscisse impaire tombaient entre deux lignes (audit
 * chapitre 7). Sans eux, le cadre reste ≤ ~17 unités de large, lisible avec un pas fixe de 1
 * (`EquationParaboleGraph`, `PAS_GRILLE_EQUATION_PARABOLE`) ; la courbe est de toute façon tracée
 * sur toute la fenêtre visible. */
export function viewBoxEquationParabole(exercice: ExerciceEquationParabole): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = [exercice.sommet, exercice.foyer, pointDirectriceProcheFoyer(exercice)].map((point) => ({
    point,
    label: "",
  }));
  return calculerViewBoxVecteurs(affiches);
}

/** Pas de quadrillage FIXE (écran ET export) — S et F sont toujours à coordonnées entières, lues
 * sur le quadrillage : jamais un pas adaptatif de 2 ou 5 unités. */
export const PAS_GRILLE_EQUATION_PARABOLE = 1;
