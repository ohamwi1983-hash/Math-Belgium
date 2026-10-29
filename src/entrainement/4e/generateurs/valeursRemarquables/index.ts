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
 * Audit du chapitre 5 : l'ancien domaine `]90°,360°]` ne donnait que 11 angles possibles. Pour
 * `ref∈{30,45,60}`, les 4 quadrants sont désormais couverts (`ref`, `180-ref`, `180+ref`, `360-ref`),
 * et un exercice sur 4 décale cette mesure de ±360° (forme négative ou ≥ 360°, à ramener dans
 * [0° ; 360°[ comme dans le premier générateur du chapitre). Les cas sur les axes sont inchangés
 * (`ref=0` ⟹ `{0°,180°}`, `0°` remplaçant l'ancien `360°` ; `ref=90` ⟹ `270°`).
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
 * Construit `angleDepart` par symétrie depuis `ref` : `ref=0` ⟹ `{0°,180°}` (axe Ox) ; `ref=90` ⟹
 * toujours `270°` (axe Oy) ; `ref∈{30,45,60}` ⟹ `{ref,180-ref,180+ref,360-ref}` (quadrants I à IV),
 * décalé de ±360° une fois sur 4.
 */
function construireAngleDepart(ref: AngleRemarquable): number {
  if (ref === 0) return randomInt(0, 1) === 0 ? 0 : 180;
  if (ref === 90) return 270;

  const bases = [ref, 180 - ref, 180 + ref, 360 - ref];
  const base = bases[randomInt(0, bases.length - 1)];
  if (randomInt(0, 3) !== 0) return base;
  return randomInt(0, 1) === 0 ? base - 360 : base + 360;
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
  // Toujours dans [0°,360°[, y compris pour une forme négative ou ≥ 360°.
  const angleReduit = ((angleDepart % 360) + 360) % 360;
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
