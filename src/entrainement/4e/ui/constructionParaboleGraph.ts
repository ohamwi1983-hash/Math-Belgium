/**
 * Géométrie présentationnelle pure de l'écran "construction" — "Construction graphique de la
 * parabole" (position 53). Cadre FIXE par exercice (audit chapitre 7) : il ne dépend que de
 * l'exercice, jamais de la position LIVE des 2 poignées — l'ancien cadrage, recalculé à chaque
 * mouvement depuis r et la droite, faisait bouger la figure pendant le glisser et s'emballait
 * (un seul geste a produit r = 541). Les 2 poignées sont plafonnées (`rMaximal`,
 * `bornesLigneConstruction`) à ce que ce cadre montre, jamais au-delà — jamais recalculé
 * différemment côté vérification (`moteur/verificationConstructionParabole.ts`).
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";

/** Décalage horizontal (repère local) de la poignée "ligne" par rapport au foyer — purement
 * visuel, pour ne jamais superposer le bras du compas et la droite construite à l'écran. */
export const DECALAGE_POIGNEE_LIGNE = 3;

/** Plus grand rayon accessible au compas — `foyer.y + 3` laisse toujours au moins 4 rayons valides
 * (strictement supérieurs à `foyer.y/2`) pour les 3 itérations, dont le rayon de repli
 * (`rCanoniqueDisponible`, au plus `foyer.y/2 + 3`), tout en gardant une figure lisible. */
export function rMaximal(exercice: ExerciceConstructionParabole): number {
  return exercice.foyer.y + 3;
}

/** Plage (ordonnée LOCALE) de la poignée "ligne" — symétrique de part et d'autre de la directrice :
 * le piège « mauvais côté » (droite à −r) reste constructible pour tout r accessible. */
export function bornesLigneConstruction(exercice: ExerciceConstructionParabole): [number, number] {
  const r = rMaximal(exercice);
  return [-r, r];
}

/** Points à couvrir par la viewBox/la grille — l'enveloppe de tout ce que les poignées plafonnées
 * peuvent atteindre : cercle de rayon maximal autour de F, poignée "ligne" à ses 2 bornes, et donc
 * tous les points d'intersection possibles (toujours à l'intérieur du cercle de rayon maximal). */
export function pointsCadreConstruction(exercice: ExerciceConstructionParabole): Point[] {
  const { foyer } = exercice;
  const r = rMaximal(exercice);
  const refX = foyer.x + DECALAGE_POIGNEE_LIGNE;
  const [ligneMin, ligneMax] = bornesLigneConstruction(exercice);
  return [
    foyer,
    { x: foyer.x, y: 0 },
    { x: foyer.x - r, y: foyer.y },
    { x: foyer.x + r, y: foyer.y },
    { x: foyer.x, y: foyer.y + r },
    { x: foyer.x, y: foyer.y - r },
    { x: refX, y: ligneMin },
    { x: refX, y: ligneMax },
  ];
}
