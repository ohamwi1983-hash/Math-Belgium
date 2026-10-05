/**
 * Couche core — "Construction graphique de la parabole" (position 53, remplace intégralement
 * l'ancienne "Construction d'une parabole par foyer et directrice — méthode cercle-droite",
 * raisonnement algébrique avec calcul de coordonnées).
 *
 * Construction géométrique PURE au compas et à l'équerre — l'élève ne lit ni n'écrit jamais de
 * coordonnées numériques. Toute la géométrie (génération ET vérification) est exprimée dans un
 * REPÈRE LOCAL où la directrice est TOUJOURS la droite `y=0` et le foyer `F=(foyer.x, foyer.y)`
 * avec `foyer.y > 0` — jamais une droite implicite générale. L'obliquité de la directrice, exigée
 * pédagogiquement ("Directrice toujours oblique"), n'existe QU'AU RENDU : une rotation `theta`
 * appliquée uniquement à l'affichage/interaction Mafs (via `<Transform rotate={theta}>`), jamais
 * aux données ni à la vérification, qui restent entièrement dans ce repère local — voir l'en-tête
 * de `ui/grilleTourneeGraph.ts` pour la justification technique complète de ce choix (Mafs ne
 * permet pas de faire pivoter nativement `Coordinates.Cartesian`/`GrilleAdaptative`, mais compose
 * correctement `userTransform` pour `MovablePoint`/le rendu des primitives Mafs).
 *
 * Réutilise directement `Point` (`core/vecteur.types.ts`).
 */
import type { Point } from "./vecteur.types";

export interface ExerciceConstructionParabole {
  /** Foyer F dans le repère LOCAL (pré-rotation) — toujours strictement au-dessus de la directrice
   * (`foyer.y > 0`), qui est toujours la droite `y=0` dans ce même repère (jamais stockée : une
   * constante n'a pas besoin de champ). */
  foyer: Point;
  /** Angle de rotation (radians), tiré aléatoirement hors des voisinages de 0/π∕2/π/3π∕2 pour
   * garantir une obliquité nette à l'écran — appliqué UNIQUEMENT au rendu (`ui/grilleTourneeGraph.ts`),
   * jamais lu par le moteur de vérification. */
  theta: number;
}

export type GenerateurExerciceConstructionParabole = () => ExerciceConstructionParabole;
