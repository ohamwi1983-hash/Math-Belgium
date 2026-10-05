/**
 * Couche core — types partagés du chapitre "Calcul vectoriel" (8 générateurs). Contrairement aux
 * croquis SVG schématiques du reste du projet (pixel-espace fixe, jamais à l'échelle réelle), ce
 * chapitre manipule directement des composantes/coordonnées réelles — voir `ui/vecteurGraph.ts` +
 * `components/VecteurGraph.tsx` pour le graphe Mafs partagé qui les affiche à l'échelle.
 */

/** Point du plan, coordonnées réelles. */
export interface Point {
  x: number;
  y: number;
}

/** Composantes d'un vecteur — même forme qu'un `Point` (un vecteur est un déplacement dx,dy) ;
 * type distinct pour la clarté sémantique du code consommateur, jamais structurellement différent. */
export interface Composantes {
  x: number;
  y: number;
}
