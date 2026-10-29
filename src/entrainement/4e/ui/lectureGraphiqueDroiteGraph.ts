/**
 * Géométrie pure du graphe Mafs de "Lecture graphique — équation d'une droite" — dérive, à partir
 * du SEUL `point`/`vecteur` de l'exercice (le vecteur étant toujours entier et PRIMITIF, voir
 * `generateurs/lectureGraphiqueDroite/index.ts`), la liste des points à coordonnées ENTIÈRES
 * réellement visibles sur le graphe (`point + k·vecteur`, k entier) — jamais stockée sur le
 * contrat Couche A, une pure dérivation présentationnelle (voir `core/lectureGraphiqueDroite.types.ts`).
 *
 * Réutilise `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`, module frère déjà partagé par le
 * chapitre "Calcul vectoriel") pour le cadrage — jamais un domaine fixe indépendant de la droite
 * réellement tracée, cadré à la place sur les points visibles eux-mêmes.
 */
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

/** 3 points entiers (k = −1, 0, 1) autour du point de référence — assez pour l'aide (2 points-exemple
 * distincts du couple canonique) et un cadrage serré (vecteur ≤ 3 en valeur absolue par
 * construction) : avec un quadrillage de pas 1 (`PAS_GRILLE_LECTURE`), chaque point tombe sur un
 * nœud lisible (audit chapitre 7, point 15 — l'ancienne fenêtre de 4 pas imposait un pas de 2
 * ou 5, les points tombaient entre les lignes). */
const K_MIN = -1;
const K_MAX = 1;

/** Pas du quadrillage, à l'écran comme à l'export : toujours 1 unité, pour que les coordonnées
 * entières des points marqués se lisent directement. */
export const PAS_GRILLE_LECTURE = 1;

/** Points à coordonnées entières réellement présents sur la droite, dans l'ordre croissant de k. */
export function pointsEntiersVisibles(exercice: ExerciceLectureGraphiqueDroite): Point[] {
  const points: Point[] = [];
  for (let k = K_MIN; k <= K_MAX; k++) {
    points.push({
      x: exercice.point.x + k * exercice.vecteur.x,
      y: exercice.point.y + k * exercice.vecteur.y,
    });
  }
  return points;
}

/** Cadrage du graphe — couvre tous les points entiers visibles, jamais un domaine fixe. */
export function viewBoxLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = pointsEntiersVisibles(exercice).map((point) => ({ point, label: "" }));
  return calculerViewBoxVecteurs(affiches);
}

/** 2 points-exemple pour l'Aide 2 — délibérément PAS le couple (point,vecteur) canonique de
 * l'exercice (k=0 et k=1), pour ne jamais suggérer une seule paire "à choisir" plutôt qu'une
 * méthode générale applicable à n'importe quelle paire de points de la droite. */
export function pointsAideExemple(exercice: ExerciceLectureGraphiqueDroite): [Point, Point] {
  const points = pointsEntiersVisibles(exercice);
  return [points[0], points[2]];
}
