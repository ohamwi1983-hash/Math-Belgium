import type { ExerciceTrianglesA, PointComplexe, SommetTriangle, StatutSommet } from "../../core6e/trianglesComplexes.types";
import { calculerModule } from "../formeTrigonometrique/familleA";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { pointEntier, rotation90, tirerEtiquettes, tirerTranslation, tirerTriangleIsocele, tirerTriangleRectangle } from "./construction";

/**
 * Couche A (6e) — génération, famille A ("Démontrer isocèle et/ou rectangle") de `6gen41`, chapitre
 * 7 "Nombres complexes". Réutilise `calculerModule` de `generateurs6e/formeTrigonometrique/
 * familleA.ts` (6gen37, Couche A ↔ Couche A libre) pour PRÉCALCULER les 3 longueurs de côtés —
 * jamais recalculées côté Couche B (voir en-tête `core6e/trianglesComplexes.types.ts`).
 *
 * 2 sous-types équiprobables (voir en-tête `core6e/trianglesComplexes.types.ts` pour la preuve
 * qu'ils ne peuvent jamais se combiner avec des longueurs entières) :
 * - "isocele" (`construction.ts`, `BANK_ISOCELES`) : 2 côtés égaux au sommet tiré, JAMAIS rectangle.
 * - "rectangle" (`BANK_PYTHAGORE`) : angle droit au sommet tiré, JAMAIS isocèle (triplet a≠b).
 *
 * Les 3 sommets A/B/C sont étiquetés ALÉATOIREMENT sur les 3 rôles géométriques (`tirerEtiquettes`)
 * — l'élève ne doit jamais pouvoir supposer "le sommet particulier est toujours A".
 */

function distance(p1: PointComplexe, p2: PointComplexe): number {
  return calculerModule(p2.re - p1.re, p2.im - p1.im);
}

function construireIsocele(): ExerciceTrianglesA {
  const { base, hauteur } = tirerTriangleIsocele();
  const { special, autre1, autre2 } = tirerEtiquettes();
  const k = tirerParmi([0, 1, 2, 3] as const);
  const { tx, ty } = tirerTranslation();

  // Repère local : apex=(0,hauteur), base gauche=(-base/2,0), base droite=(base/2,0).
  const localApex = rotation90(0, hauteur, k);
  const localGauche = rotation90(-base / 2, 0, k);
  const localDroite = rotation90(base / 2, 0, k);

  const points: Record<SommetTriangle, PointComplexe> = {
    [special]: pointEntier(localApex.x + tx, localApex.y + ty),
    [autre1]: pointEntier(localGauche.x + tx, localGauche.y + ty),
    [autre2]: pointEntier(localDroite.x + tx, localDroite.y + ty),
  } as Record<SommetTriangle, PointComplexe>;

  const A = points.A;
  const B = points.B;
  const C = points.C;

  return {
    famille: "A",
    sousType: "isocele",
    A,
    B,
    C,
    longueurAB: distance(A, B),
    longueurAC: distance(A, C),
    longueurBC: distance(B, C),
    sommetIsocele: special,
    sommetRectangle: "aucun",
  };
}

function construireRectangle(): ExerciceTrianglesA {
  const { a, b } = tirerTriangleRectangle();
  const { special, autre1, autre2 } = tirerEtiquettes();
  const k = tirerParmi([0, 1, 2, 3] as const);
  const { tx, ty } = tirerTranslation();
  // Choix aléatoire de la cathète assignée à autre1 (variété — l'énoncé ne privilégie jamais un
  // ordre a,b fixe).
  const [ca, cb] = tirerParmi([
    [a, b],
    [b, a],
  ]);

  const localDroit = rotation90(0, 0, k);
  const localLeg1 = rotation90(ca, 0, k);
  const localLeg2 = rotation90(0, cb, k);

  const points: Record<SommetTriangle, PointComplexe> = {
    [special]: pointEntier(localDroit.x + tx, localDroit.y + ty),
    [autre1]: pointEntier(localLeg1.x + tx, localLeg1.y + ty),
    [autre2]: pointEntier(localLeg2.x + tx, localLeg2.y + ty),
  } as Record<SommetTriangle, PointComplexe>;

  const A = points.A;
  const B = points.B;
  const C = points.C;

  return {
    famille: "A",
    sousType: "rectangle",
    A,
    B,
    C,
    longueurAB: distance(A, B),
    longueurAC: distance(A, C),
    longueurBC: distance(B, C),
    sommetIsocele: "aucun" as StatutSommet,
    sommetRectangle: special,
  };
}

export function construireFamilleA(): ExerciceTrianglesA {
  return tirerParmi(["isocele", "rectangle"] as const) === "isocele" ? construireIsocele() : construireRectangle();
}
