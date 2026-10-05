/**
 * Couche A — géométrie pure PARTAGÉE par les familles L "hauteurArbre" et N "sectionFalaise"
 * (`anglePartage`, extension de la banque — `promptextensionbanquesgen57gen58.md`) : nouveau
 * mécanisme de triangle pont QUELCONQUE en `anglePartage`, absent des 4 familles d'origine (aucune
 * ne combine pont quelconque + hypothèse de verticalité).
 *
 * Combine 2 mécaniques déjà en place ailleurs dans ce générateur, jamais ensemble avant :
 * - **Pont par triangulation via un repère atteignable R** — même principe que
 *   `distanceInaccessible.ts` (`resoudreAAS` + relabellage pour que le côté transféré tombe en
 *   slot `a`) : baseline `OR=d` connue, 2 angles connus (`thetaM` en O, `rho` en R) → transfère
 *   `OM`. `thetaM` (angle ROM en O) joue un DOUBLE rôle, honnête géométriquement : c'est aussi
 *   l'angle d'ÉLÉVATION vers M utilisé dans le triangle cible (voir ci-dessous) — cohérent
 *   puisque `OR` est horizontale (R au sol, comme O) : mesurer l'angle "ROM" depuis l'horizontale
 *   OR revient exactement à mesurer l'élévation de M depuis O. Contrairement à `hauteurInaccessible.ts`,
 *   le pied F de l'objet (inaccessible — terrain marécageux, falaise...) n'est JAMAIS traversé par
 *   la mesure : on triangule via R plutôt que de mesurer OF/hM directement.
 * - **Cible par hypothèse de verticalité** — même principe que `hauteurInaccessible.ts` (angle
 *   utile = thetaT-thetaM, hypothèse = 90+thetaM) : cette dérivation ne dépend que de `thetaM` (une
 *   élévation depuis O) et de la colinéarité verticale de M/T — jamais de la façon dont `OM` a été
 *   obtenu, donc valable à l'identique ici bien que `OM` vienne d'une triangulation plutôt que d'un
 *   triangle rectangle direct (preuve : `pontBaselineVerticalite.test.ts`, reconstruction
 *   indépendante par coordonnées).
 *
 * `hM` (hauteur de M) n'est PAS un paramètre choisi séparément (contrairement à
 * `hauteurInaccessible.ts`) : il est ENTIÈREMENT dérivé (`OM·sin(thetaM)`), puisque `OM` lui-même
 * n'est plus obtenu depuis `hM` — cohérent avec le fait que ni `hauteurInaccessible.ts` ni
 * `distanceInaccessible.ts` n'imposent de propreté entière sur les côtés calculés (seuls les angles
 * sont tirés entiers), la "convention arrondie" (tolérance ±0,5) couvrant déjà l'imprécision.
 */
import type { Triangle } from "../../core/triangle.types";
import { resoudreAAS } from "../triangle/resoudreTriangle";

export interface PontBaselineVerticalite {
  trianglePont: Triangle;
  triangleCible: Triangle;
  OM: number;
}

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

/**
 * @param d baseline OR (connue)
 * @param thetaM angle ROM en O == angle d'élévation vers M depuis O (double rôle, voir en-tête)
 * @param rho angle ORM en R (connu)
 * @param thetaT angle d'élévation vers T depuis O (thetaT > thetaM par construction de l'appelant)
 */
export function resoudrePontBaselineVerticalite(d: number, thetaM: number, rho: number, thetaT: number): PontBaselineVerticalite {
  const angleEnM = 180 - thetaM - rho;
  // resoudreAAS(A,B,a) : A=angleEnM (opposé au côté connu d=OR), B=thetaM → sort {a:d, A:angleEnM,
  // b:RM, B:thetaM, c:OM, C:rho}. Relabellé pour que trianglePont.a === OM (le côté transféré),
  // toujours en slot `a` par convention — même principe que `distanceInaccessible.ts`.
  const brut = resoudreAAS(angleEnM, thetaM, d);
  const trianglePont: Triangle = { a: brut.c, A: brut.C, b: brut.a, B: brut.A, c: brut.b, C: brut.B };
  const OM = trianglePont.a;

  const angleUtile = thetaT - thetaM;
  const angleHypothese = 90 + thetaM;
  const angleEnT = 180 - angleUtile - angleHypothese;
  const sinT = Math.sin(versRadians(angleEnT));
  const MT = (OM * Math.sin(versRadians(angleUtile))) / sinT;
  const OT = (OM * Math.sin(versRadians(angleHypothese))) / sinT;
  const triangleCible: Triangle = { a: OM, A: angleEnT, b: MT, B: angleUtile, c: OT, C: angleHypothese };

  return { trianglePont, triangleCible, OM };
}
