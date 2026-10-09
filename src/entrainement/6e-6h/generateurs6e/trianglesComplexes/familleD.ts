import type { ExerciceTrianglesD, PointComplexe } from "../../core6e/trianglesComplexes.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { pointEntier } from "./construction";

/**
 * Couche A (6e) — génération, famille D ("Similitude entre deux triangles") de `6gen41`.
 *
 * ============================================================================
 * **Simplification délibérée — points ET angle de similitude restreints aux multiples de 90°**
 * ============================================================================
 * Contrairement aux autres familles du chapitre 7 qui piochent dans les 16 angles remarquables
 * (multiples de π/6 ou π/4, voir `generateurs6e/formeTrigonometrique/familleA.ts`), cette famille
 * restreint `A`, `B` ET l'angle de la similitude θ aux 4 directions d'AXE (0°/90°/180°/270°)
 * uniquement. Raison : le multiplicateur `k·e^{iθ}` doit rester un `a+bi` TAPABLE tel quel par
 * l'élève à l'écran 3 (`moteur6e/expressionComplexe.ts`, AUCUN support de `sqrt` — voir son
 * en-tête) — avec un angle remarquable "hors axe" (30°,45°,60°...), `cos θ`/`sin θ` seraient
 * `±1/2`/`±√2/2`/`±√3/2`, introduisant un radical dans le multiplicateur. Restreint à l'axe,
 * `cos θ,sin θ ∈ {0,±1}` : le multiplicateur `k·(cosθ+i sinθ)` reste TOUJOURS un entier exact
 * (`k` entier × {0,±1}), cohérent avec le choix "éviter l'irrationnel" du reste du générateur (voir
 * en-tête `core6e/trianglesComplexes.types.ts`). `A`/`B` sont eux-mêmes restreints au même ensemble
 * d'axes pour la même raison : `z_C=k·e^{iθ}·z_A` doit rester un point à coordonnées ENTIÈRES
 * affichables proprement (le produit de 2 valeurs sur l'axe reste sur l'axe).
 */

const DIRECTIONS = [0, 1, 2, 3] as const;
const RAYONS = [1, 2, 3, 4] as const;
const RAPPORTS = [2, 3, 4] as const;
/** Rotation non triviale — exclut 0 (identité, sans intérêt pédagogique). */
const PAS_ROTATION = [1, 2, 3] as const;

function directionVersPoint(direction: number, r: number): { re: number; im: number } {
  switch (direction) {
    case 0:
      return { re: r, im: 0 };
    case 1:
      return { re: 0, im: r };
    case 2:
      return { re: -r, im: 0 };
    default:
      return { re: 0, im: -r };
  }
}

/** Latex/numérique de `pas×90°`, réduit dans `(-π;π]` — même convention que le reste du chapitre 7
 * (voir en-tête `generateurs6e/formeTrigonometrique/angles.ts`). */
function angleDepuisPas(pas: number): { latex: string; numerique: number } {
  switch (pas) {
    case 1:
      return { latex: "\\frac{\\pi}{2}", numerique: Math.PI / 2 };
    case 2:
      return { latex: "\\pi", numerique: Math.PI };
    default:
      return { latex: "-\\frac{\\pi}{2}", numerique: -Math.PI / 2 };
  }
}

/** Multiplicateur `k·e^{i·pas·90°}` sous forme a+bi — TOUJOURS entier (voir en-tête de fichier). */
function multiplicateurDepuisPas(k: number, pas: number): { re: number; im: number } {
  switch (pas) {
    case 1:
      return { re: 0, im: k };
    case 2:
      return { re: -k, im: 0 };
    default:
      return { re: 0, im: -k };
  }
}

export function construireFamilleD(): ExerciceTrianglesD {
  const dA = tirerParmi(DIRECTIONS);
  const dB = tirerParmi(DIRECTIONS.filter((d) => d !== dA));
  const rA = tirerParmi(RAYONS);
  const rB = tirerParmi(RAYONS);
  const rapport = tirerParmi(RAPPORTS);
  const pas = tirerParmi(PAS_ROTATION);

  const O: PointComplexe = { re: 0, im: 0, latex: "0" };
  const ptA = directionVersPoint(dA, rA);
  const ptB = directionVersPoint(dB, rB);
  const dC = ((dA + pas) % 4) as 0 | 1 | 2 | 3;
  const dD = ((dB + pas) % 4) as 0 | 1 | 2 | 3;
  const ptC = directionVersPoint(dC, rA * rapport);
  const ptD = directionVersPoint(dD, rB * rapport);

  const A = pointEntier(ptA.re, ptA.im);
  const B = pointEntier(ptB.re, ptB.im);
  const C = pointEntier(ptC.re, ptC.im);
  const D = pointEntier(ptD.re, ptD.im);

  const angle = angleDepuisPas(pas);
  const multiplicateur = multiplicateurDepuisPas(rapport, pas);

  return {
    famille: "D",
    O,
    A,
    B,
    C,
    D,
    rapport,
    angleLatex: angle.latex,
    angleNumerique: angle.numerique,
    multiplicateurRe: multiplicateur.re,
    multiplicateurIm: multiplicateur.im,
  };
}
