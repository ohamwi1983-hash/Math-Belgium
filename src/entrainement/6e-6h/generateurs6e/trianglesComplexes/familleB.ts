import type { ExerciceTrianglesB } from "../../core6e/trianglesComplexes.types";
import { calculerModule } from "../formeTrigonometrique/familleA";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { pointEntier, rotation90, tirerTranslation, tirerTriangleIsocele } from "./construction";

/**
 * Couche A (6e) — génération, famille B ("Triangle isocèle non rectangle, loi des cosinus") de
 * `6gen41`. Réutilise EXACTEMENT la même banque de triangles isocèles entiers que la famille A
 * (`tirerTriangleIsocele`, `construction.ts`, Couche A ↔ Couche A) — apex TOUJOURS en O (jamais
 * randomisé sur A/B/C, contrairement à la famille A : O est un nom fixe de ce générateur, pas une
 * étiquette de sommet).
 *
 * ============================================================================
 * **Angle à l'apex — DÉCIMAL non remarquable par construction, vérifié par TOLÉRANCE**
 * ============================================================================
 * Loi des cosinus : `base² = 2·côté² − 2·côté²·cos(apex)` ⟹ `cos(apex) = 1 − base²/(2·côté²)`.
 * Pour les triplets entiers de `BANK_ISOCELES` (ex. côté=5,base=6 ⟹ cos(apex)=1−36/50=0.28 ⟹
 * apex≈73.74°), cet angle n'est JAMAIS un angle remarquable (30/45/60/90°...) — SEUL écran de tout
 * le chapitre 7 à ce jour où une comparaison DÉCIMALE (tolérance) remplace l'égalité EXACTE
 * habituelle (voir en-tête `core6e/trianglesComplexes.types.ts`). Tolérance choisie : `0.1°` —
 * absorbe un arrondi élève à 1-2 décimales sans jamais confondre 2 apex plausibles distincts (les
 * valeurs de la banque sont espacées de plusieurs degrés).
 */
export const TOLERANCE_ANGLE_DEGRES = 0.1;

function distance(p1: { re: number; im: number }, p2: { re: number; im: number }): number {
  return calculerModule(p2.re - p1.re, p2.im - p1.im);
}

export function construireFamilleB(): ExerciceTrianglesB {
  const { cote, base, hauteur } = tirerTriangleIsocele();
  const k = tirerParmi([0, 1, 2, 3] as const);
  const { tx, ty } = tirerTranslation();

  const localO = rotation90(0, hauteur, k);
  const localA = rotation90(-base / 2, 0, k);
  const localB = rotation90(base / 2, 0, k);

  const O = pointEntier(localO.x + tx, localO.y + ty);
  const A = pointEntier(localA.x + tx, localA.y + ty);
  const B = pointEntier(localB.x + tx, localB.y + ty);

  const cosApex = 1 - (base * base) / (2 * cote * cote);
  const angleApexDeg = (Math.acos(cosApex) * 180) / Math.PI;
  const angleBaseDeg = (180 - angleApexDeg) / 2;

  return {
    famille: "B",
    O,
    A,
    B,
    longueurOA: distance(O, A),
    longueurOB: distance(O, B),
    longueurAB: distance(A, B),
    sommetIsocele: "O",
    sommetRectangle: "aucun",
    angleApexDeg,
    angleBaseDeg,
  };
}
