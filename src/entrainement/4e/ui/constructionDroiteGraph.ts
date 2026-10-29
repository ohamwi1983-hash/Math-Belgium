/**
 * Géométrie pure du graphe Mafs de l'écran "trace" — réutilise `calculerViewBoxVecteurs`
 * (`ui/vecteurGraph.ts`, module frère) pour calculer un cadrage FIXE pour tout l'écran : il couvre
 * les 2 points CIBLES (jamais affichés directement — ce serait donner la réponse), l'origine et les
 * positions initiales des marqueurs. Il ne dépend plus des marqueurs en cours de déplacement :
 * l'ancien cadrage, recalculé à chaque mouvement, faisait bouger la fenêtre sous le doigt pendant
 * le glisser (audit chapitre 7, point 16). Les marqueurs restent bornés au cadre
 * (`bornerAuViewBox`).
 */
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";
import type { Point } from "../core/vecteur.types";

export function viewBoxConstructionDroite(cible1: Point, cible2: Point, marqueursInitiaux: Point[]): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = [cible1, cible2, { x: 0, y: 0 }, ...marqueursInitiaux].map((point) => ({ point, label: "" }));
  return calculerViewBoxVecteurs(affiches);
}

/** Point entier le plus proche de `point` qui reste dans le cadre (marqueur jamais perdu hors de la
 * fenêtre). */
export function bornerAuViewBox(point: Point, viewBox: ReturnType<typeof calculerViewBoxVecteurs>): Point {
  const borner = (v: number, [min, max]: [number, number]) => Math.min(Math.floor(max), Math.max(Math.ceil(min), v));
  return { x: borner(point.x, viewBox.x), y: borner(point.y, viewBox.y) };
}

/** Écart maximal (en unités) jusqu'auquel le quadrillage garde un pas de 1 : au-delà (points très
 * éloignés choisis par l'élève à l'écran 1), le pas redevient adaptatif pour rester lisible. */
const ETENDUE_MAX_PAS_UNITE = 20;

/** Pas du quadrillage : 1 unité tant que la fenêtre le permet — les marqueurs se calent sur les
 * entiers, un pas de 2 laissait les points impairs entre deux lignes (audit chapitre 7, point 18). */
export function pasGrilleConstructionDroite(viewBox: ReturnType<typeof calculerViewBoxVecteurs>): number | undefined {
  const etendue = Math.max(viewBox.x[1] - viewBox.x[0], viewBox.y[1] - viewBox.y[0]);
  return etendue <= ETENDUE_MAX_PAS_UNITE ? 1 : undefined;
}
