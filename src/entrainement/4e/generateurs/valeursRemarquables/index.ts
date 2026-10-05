/**
 * Couche A — "Valeurs remarquables". Réutilise directement, depuis le premier générateur du
 * chapitre (`cercleTrigonometrique`), les fonctions pures de `quadrantCalculs.ts`
 * (`calculerQuadrant`/`calculerSigneSin`/`calculerSigneCos`/`calculerSigneTan`) — import
 * générateur→générateur, explicitement autorisé par l'architecture du projet. Le signe retourné
 * par ces fonctions (`"+"`/`"-"`/`"0"`/`"indefini"`) s'applique directement à la MAGNITUDE exacte de
 * l'angle du premier quadrant (`tables.ts`) : les deux informations sont indépendantes et se
 * combinent sans aucun cas particulier supplémentaire (vérifié pour les 5 angles × 4 quadrants +
 * les 2 axes, voir les tests).
 *
 * Refonte `promptcreationgenerateur15.md` — domaine restreint à `]90°,360°]` (jamais `[0°,90°]`,
 * quadrant I exclu) : `construireAngleDepart` ne tire donc plus jamais la branche "quadrant I"
 * (`ref` lui-même) de l'ancienne formule à 4 branches — seules les 3 branches restantes
 * (`180-ref`/`180+ref`/`360-ref`, quadrants II/III/IV) sont conservées pour `ref∈{30,45,60}`. `ref=0`
 * ne couvre plus que `{180°,360°}` (`0°` exclu) et `ref=90` ne couvre plus que `{270°}` (`90°`
 * exclu, donc plus aucun tirage aléatoire nécessaire pour ce cas).
 */
import type {
  AngleRemarquable,
  ExerciceValeursRemarquables,
  GenerateurExerciceValeursRemarquables,
} from "../../core/valeursRemarquables.types";
import type { Signe, SigneTan } from "../../core/cercleTrigonometrique.types";
import { calculerQuadrant, calculerSigneCos, calculerSigneSin, calculerSigneTan } from "../cercleTrigonometrique/quadrantCalculs";
import { randomInt } from "./aleatoire";
import { LATEX_COS, LATEX_SIN, LATEX_TAN, MAGNITUDE_COS, MAGNITUDE_SIN, MAGNITUDE_TAN } from "./tables";

const ANGLES_REMARQUABLES: AngleRemarquable[] = [0, 30, 45, 60, 90];

/**
 * Construit `angleDepart` par symétrie depuis `ref`, dans le domaine `]90°,360°]` uniquement
 * (spec section "Variantes") : `ref=0` ⟹ `{180°,360°}` (axe Ox, `0°` exclu du domaine) ; `ref=90`
 * ⟹ toujours `270°` (axe Oy, `90°` exclu — un seul angle possible, jamais de tirage) ; `ref∈{30,45,
 * 60}` ⟹ `{180-ref,180+ref,360-ref}` (quadrants II/III/IV — `ref` lui-même, quadrant I, exclu).
 */
function construireAngleDepart(ref: AngleRemarquable): number {
  if (ref === 0) return randomInt(0, 1) === 0 ? 180 : 360;
  if (ref === 90) return 270;

  switch (randomInt(0, 2)) {
    case 0:
      return 180 - ref;
    case 1:
      return 180 + ref;
    default:
      return 360 - ref;
  }
}

function appliquerSigneValeur(signe: Signe, magnitude: number): number {
  return signe === "0" ? 0 : signe === "-" ? -magnitude : magnitude;
}

function appliquerSigneLatex(signe: Signe, latex: string): string {
  return signe === "0" ? "0" : signe === "-" ? `-${latex}` : latex;
}

function appliquerSigneTanValeur(signe: SigneTan, magnitude: number | null): number | null {
  if (signe === "indefini" || magnitude === null) return null;
  return appliquerSigneValeur(signe, magnitude);
}

function appliquerSigneTanLatex(signe: SigneTan, latex: string): string {
  return signe === "indefini" ? "n'existe pas" : appliquerSigneLatex(signe, latex);
}

/** Convention CLAUDE.md ("Catalogue de variantes") — force l'angle du premier quadrant demandé. */
export function construireAvecVarianteId(
  varianteId: AngleRemarquable,
  overrides?: { angleDepart?: number },
): ExerciceValeursRemarquables {
  const angleDepart = overrides?.angleDepart ?? construireAngleDepart(varianteId);
  // Toujours dans [0°,360°[ — angleDepart=360 est le seul cas du domaine ]90°,360°] où la
  // normalisation modulo change réellement la valeur (360%360=0).
  const angleReduit = angleDepart % 360;
  const quadrant = calculerQuadrant(angleReduit);
  const signeSin = calculerSigneSin(angleReduit, quadrant);
  const signeCos = calculerSigneCos(angleReduit, quadrant);
  const signeTan = calculerSigneTan(quadrant);

  return {
    angleDepart,
    angleReduit,
    anglePremierQuadrant: varianteId,
    quadrant,
    sinValeur: appliquerSigneValeur(signeSin, MAGNITUDE_SIN[varianteId]),
    cosValeur: appliquerSigneValeur(signeCos, MAGNITUDE_COS[varianteId]),
    tanValeur: appliquerSigneTanValeur(signeTan, MAGNITUDE_TAN[varianteId]),
    sinLatex: appliquerSigneLatex(signeSin, LATEX_SIN[varianteId]),
    cosLatex: appliquerSigneLatex(signeCos, LATEX_COS[varianteId]),
    tanLatex: appliquerSigneTanLatex(signeTan, LATEX_TAN[varianteId]),
  };
}

export const CATALOGUE_VARIANTES: { id: AngleRemarquable; label: string }[] = ANGLES_REMARQUABLES.map((angle) => ({
  id: angle,
  label: `${angle}°`,
}));

export const genererExerciceValeursRemarquables: GenerateurExerciceValeursRemarquables = () => {
  const ref = ANGLES_REMARQUABLES[randomInt(0, ANGLES_REMARQUABLES.length - 1)];
  return construireAvecVarianteId(ref);
};
