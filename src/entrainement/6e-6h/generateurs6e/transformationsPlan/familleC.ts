import type { AffixeEntiere, ExerciceTransfoC } from "../../core6e/transformationsPlan.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";
import { additionnerAngles } from "../formeTrigonometrique/angles";
import { appliquerRotationAxe, tirerAffixeEntiereArbitraire, tirerAffixeEntiereRemarquable, tirerAngleAxeNonNul } from "./partage";

/**
 * Couche A (6e) — génération, famille C ("Similitude centrée en O, modules égaux") de `6gen40`,
 * chapitre 7 "Nombres complexes".
 *
 * ============================================================================
 * **Construction — `zB` est une ROTATION de `zA`, jamais un tirage indépendant**
 * ============================================================================
 * `zA` est tiré "propre" (`tirerAffixeEntiereRemarquable`, axe/quart, entier — voir `partage.ts`) ;
 * `zB` est ensuite obtenu en appliquant une rotation d'axe non nulle à `zA`
 * (`appliquerRotationAxe`) plutôt que tiré indépendamment. Cette construction garantit
 * MÉCANIQUEMENT, sans aucune boucle de rejet :
 * - `|zA|=|zB|` EXACTEMENT (une rotation conserve le module) — le cœur de la spec ("modules égaux
 *   par construction") ;
 * - `arg(zB)-arg(zA)` = exactement l'angle d'axe choisi, réduit — donc TOUJOURS dans
 *   `{π/2, π, -π/2}` (voir en-tête `core6e/transformationsPlan.types.ts`), condition nécessaire
 *   pour que la rotation appliquée à `autresPoints` (écran 3) reste typable en a+bi entier.
 * `angleRotation` est malgré tout recalculé explicitement via `additionnerAngles(angleB, angleA,
 * -1)` (arg(zB)-arg(zA), jamais un raccourci qui réutiliserait directement l'angle d'axe tiré) —
 * cohérence vérifiée par test (`familleC.test.ts`), pour que la vérité de référence corresponde
 * EXACTEMENT au calcul que l'élève doit reproduire à l'écran 2.
 */

const NOMBRE_AUTRES_POINTS_MIN = 2;
const NOMBRE_AUTRES_POINTS_MAX = 3;
const PORTEE_AUTRES_POINTS = 5;

function tirerAutresPoints(): AffixeEntiere[] {
  const n = tirerEntier(NOMBRE_AUTRES_POINTS_MIN, NOMBRE_AUTRES_POINTS_MAX);
  const points: AffixeEntiere[] = [];
  while (points.length < n) {
    const p = tirerAffixeEntiereArbitraire(PORTEE_AUTRES_POINTS);
    if (points.some((q) => q.a === p.a && q.b === p.b)) continue;
    points.push(p);
  }
  return points;
}

export function construireFamilleC(): ExerciceTransfoC {
  const tireA = tirerAffixeEntiereRemarquable();
  const zA: AffixeEntiere = { a: tireA.a, b: tireA.b };
  const axisDelta = tirerAngleAxeNonNul();
  const zB = appliquerRotationAxe(zA, axisDelta);
  const angleB = additionnerAngles(tireA.angle, axisDelta);
  const angleRotation = additionnerAngles(angleB, tireA.angle, -1);

  const autresPoints = tirerAutresPoints();
  const imagesAutresPoints = autresPoints.map((p) => appliquerRotationAxe(p, angleRotation));

  return {
    famille: "C",
    zA,
    angleA: tireA.angle,
    zB,
    angleB,
    moduleCommun: tireA.r,
    angleRotation,
    autresPoints,
    imagesAutresPoints,
  };
}
