/**
 * Couche A — géométrie pure PARTAGÉE par les familles P "naviresConvergents" et Q
 * "randonneursSommet" (`sommetPartage`, nouvelle configuration — voir `core/triangleLies.types.ts`
 * pour la description générale). Contrairement à `cotePartage`/`anglePartage` (une seule valeur
 * transférée), l'écran "pont" de `sommetPartage` demande 3 valeurs : l'angle au sommet commun `A`
 * ET les 2 côtés `b`/`c` qui en partent.
 *
 * Réutilise `resoudreAAS` SANS relabellage (contrairement à `pontBaselineVerticalite.ts`) : le
 * sommet commun O, et deux destinations M1/M2 reliées par une baseline connue (opposée à O).
 * `angleFinal1`/`angleFinal2` sont les 2 angles connus AUX destinations (angle O-M1-M2 en M1, angle
 * O-M2-M1 en M2) — l'angle au sommet `angleSommet = 180 - angleFinal1 - angleFinal2` s'en déduit
 * par simple arithmétique, puis `resoudreAAS(angleSommet, angleFinal2, baseline)` (la baseline est
 * bien opposée à `angleSommet`, puisqu'elle relie M1 et M2 sans jamais toucher O) retourne
 * DIRECTEMENT `{A: angleSommet, b: OM1, c: OM2}` — `b` est opposé à `angleFinal2` (donc ne touche
 * pas M2, donc `b = O-M1`, la route du mobile 1) et `c` (opposé à l'angle `C` auto-calculé =
 * `angleFinal1`) ne touche pas M1, donc `c = O-M2`, la route du mobile 2. `a` reste la baseline
 * DONNÉE, jamais consommée comme "valeur transférée" pour cette configuration (divergence
 * documentée par rapport aux 2 autres configurations, voir le type `Triangle` en tête de fichier
 * appelant).
 */
import type { Triangle } from "../../core/triangle.types";
import { resoudreAAS } from "../triangle/resoudreTriangle";

/**
 * @param angleFinal1 angle O-M1-M2 (à la destination du mobile 1) — donné
 * @param angleFinal2 angle O-M2-M1 (à la destination du mobile 2) — donné
 * @param baseline distance M1-M2 (opposée au sommet commun O) — donnée
 * @returns Triangle avec A = angle au sommet commun, b = route du mobile 1 (O-M1), c = route du
 *   mobile 2 (O-M2), a = la baseline donnée
 */
export function resoudrePontSommetPartageQuelconque(angleFinal1: number, angleFinal2: number, baseline: number): Triangle {
  const angleSommet = 180 - angleFinal1 - angleFinal2;
  return resoudreAAS(angleSommet, angleFinal2, baseline);
}
