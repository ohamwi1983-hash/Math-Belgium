/**
 * Couche core — « Composer deux forces ou deux vitesses » (gen80, 4e, chapitre 5, section
 * « triangulation », processus 3 TRANSFÉRER). Pont entre la trigonométrie du chapitre 5 (Al-Kashi,
 * loi des sinus) et la règle du parallélogramme du chapitre 6 (calcul vectoriel).
 *
 * Deux vecteurs partent d'un même point O : le GRAND (vitesse propre, ou première force, indice 1)
 * et le PETIT (courant, vent, ou seconde force, indice 2). Leur résultante est la diagonale [OC] du
 * parallélogramme construit sur eux. Sommets de la figure : O (origine commune), l'extrémité de
 * chaque vecteur (A et B, l'attribution est tirée au hasard) et C (extrémité de la résultante).
 *
 * - Sens direct (`intensite`, `direction`) : on connaît les deux intensités et l'angle θ ENTRE les
 *   deux vecteurs. Le triangle utile est O–(extrémité du grand vecteur)–C : son angle en ce sommet
 *   vaut 180° − θ (deux angles consécutifs d'un parallélogramme sont supplémentaires) — le piège de
 *   transfert est de mettre θ directement dans Al-Kashi.
 * - Cap à prendre (`cap`) : on connaît les deux intensités et l'angle β entre le petit vecteur
 *   (courant, vent) et la ROUTE voulue, direction imposée de la résultante ; la direction du grand
 *   vecteur (le cap) est l'inconnue. Le triangle utile est O–(extrémité du petit vecteur)–C : son
 *   angle en O vaut β, et la loi des sinus donne d'abord l'angle en C (l'angle entre le cap et la
 *   route).
 */

export type SituationComposerForces = "bateau" | "avion" | "remorqueurs" | "charge";

/** `intensite` : intensité de la résultante seule (3 écrans) ; `direction` : intensité puis angle
 * entre la résultante et le grand vecteur (4 écrans) ; `cap` : cap à prendre (4 écrans). */
export type QuestionComposerForces = "intensite" | "direction" | "cap";

export type UniteComposerForces = "N" | "kN" | "km/h" | "nœuds";

export type SommetExtremite = "A" | "B";

/** Nom d'un triangle de la figure proposé à l'écran 1. */
export type NomTriangle = "OAB" | "OAC" | "OBC" | "ABC";

export interface ExerciceComposerForces {
  situation: SituationComposerForces;
  question: QuestionComposerForces;
  unite: UniteComposerForces;
  /** Intensité du grand vecteur (entier). */
  grand: number;
  /** Intensité du petit vecteur (entier, toujours strictement inférieure à `grand`). */
  petit: number;
  /** Sens direct : angle θ entre les deux vecteurs ; cap : angle β entre le petit vecteur et la
   * route voulue. Degrés entiers, jamais entre 80° et 100°. */
  angle: number;
  /** Lettre de l'extrémité du grand vecteur (l'extrémité du petit porte l'autre lettre). */
  sommetGrand: SommetExtremite;
  /** Ordre d'affichage des trois triangles proposés à l'écran 1 (tiré à la génération, pour que le
   * QR code d'une feuille rouvre exactement le même écran). */
  ordreTriangles: NomTriangle[];
}
