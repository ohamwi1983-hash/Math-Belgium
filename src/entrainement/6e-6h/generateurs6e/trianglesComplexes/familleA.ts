import type { ExerciceTrianglesA, PointComplexe, SommetTriangle, SousTypeTrianglesA, StatutSommet } from "../../core6e/trianglesComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { distanceCarree, longueurEntre, pointEntier, rotation90, tirerEtiquettes, tirerOrdres, tirerTranslation, tirerTriangleIsocele, tirerTriangleRectangle } from "./construction";

/**
 * Couche A (6e) — génération, famille A (« isocèle, rectangle, les deux ou aucun ») de `6gen41`,
 * chapitre 5 « Nombres complexes ».
 *
 * **Audit 6e ch. 5, point 43 (décision I) — 4 cas ÉQUIPROBABLES** (auparavant 2, jamais « isocèle
 * rectangle » ni « quelconque » : les 2 écrans de verdict n'avaient chacun que 2 réponses liées) :
 * - "isocele" (`BANK_ISOCELES`) : côtés entiers, isocèle au sommet tiré, jamais rectangle ;
 * - "rectangle" (`BANK_PYTHAGORE`) : angle droit au sommet tiré, jamais isocèle (a ≠ b) ;
 * - "isoceleRectangle" : sommet S + (p ; q) et S + (−q ; p) — rotation d'un quart de tour, donc
 *   SA = SB et angle droit en S ; côtés √(p²+q²) et √(2(p²+q²)) (saisie `sqrt(n)` acceptée) ;
 * - "quelconque" : 3 points entiers tirés au hasard, rejetés s'ils sont alignés, s'ils ont 2 côtés
 *   égaux ou si une relation de Pythagore tient (tests EXACTS sur les carrés entiers).
 * Verdicts : « isocèle » 1 fois sur 2 (réparti sur A, B, C), « rectangle » 1 fois sur 2.
 * Les étiquettes A/B/C sont attribuées au hasard aux rôles géométriques (`tirerEtiquettes`).
 */

const SOUS_TYPES: SousTypeTrianglesA[] = ["isocele", "rectangle", "isoceleRectangle", "quelconque"];

function assembler(sousType: SousTypeTrianglesA, points: Record<SommetTriangle, PointComplexe>, sommetIsocele: StatutSommet, sommetRectangle: StatutSommet): ExerciceTrianglesA {
  const { A, B, C } = points;
  return { famille: "A", sousType, A, B, C, AB: longueurEntre(A, B), AC: longueurEntre(A, C), BC: longueurEntre(B, C), sommetIsocele, sommetRectangle, ordres: tirerOrdres() };
}

function placer(special: SommetTriangle, autre1: SommetTriangle, autre2: SommetTriangle, locaux: { x: number; y: number }[]): Record<SommetTriangle, PointComplexe> {
  const k = tirerParmi([0, 1, 2, 3] as const);
  const { tx, ty } = tirerTranslation();
  const [p0, p1, p2] = locaux.map((p) => rotation90(p.x, p.y, k));
  return {
    [special]: pointEntier(p0.x + tx, p0.y + ty),
    [autre1]: pointEntier(p1.x + tx, p1.y + ty),
    [autre2]: pointEntier(p2.x + tx, p2.y + ty),
  } as Record<SommetTriangle, PointComplexe>;
}

function construireIsocele(): ExerciceTrianglesA {
  const { base, hauteur } = tirerTriangleIsocele();
  const { special, autre1, autre2 } = tirerEtiquettes();
  const points = placer(special, autre1, autre2, [
    { x: 0, y: hauteur },
    { x: -base / 2, y: 0 },
    { x: base / 2, y: 0 },
  ]);
  return assembler("isocele", points, special, "aucun");
}

function construireRectangle(): ExerciceTrianglesA {
  const { a, b } = tirerTriangleRectangle();
  const { special, autre1, autre2 } = tirerEtiquettes();
  const [ca, cb] = tirerParmi([
    [a, b],
    [b, a],
  ]);
  const points = placer(special, autre1, autre2, [
    { x: 0, y: 0 },
    { x: ca, y: 0 },
    { x: 0, y: cb },
  ]);
  return assembler("rectangle", points, "aucun", special);
}

function construireIsoceleRectangle(): ExerciceTrianglesA {
  let p = 0;
  let q = 0;
  while (p === 0 && q === 0) {
    p = tirerEntier(1, 6);
    q = tirerEntier(0, 6);
  }
  const { special, autre1, autre2 } = tirerEtiquettes();
  const points = placer(special, autre1, autre2, [
    { x: 0, y: 0 },
    { x: p, y: q },
    { x: -q, y: p },
  ]);
  return assembler("isoceleRectangle", points, special, special);
}

const PORTEE_QUELCONQUE = 6;

function construireQuelconque(): ExerciceTrianglesA {
  for (;;) {
    const tirer = () => pointEntier(tirerEntier(-PORTEE_QUELCONQUE, PORTEE_QUELCONQUE), tirerEntier(-PORTEE_QUELCONQUE, PORTEE_QUELCONQUE));
    const A = tirer();
    const B = tirer();
    const C = tirer();
    const ab = distanceCarree(A, B);
    const ac = distanceCarree(A, C);
    const bc = distanceCarree(B, C);
    const aire2 = (B.re - A.re) * (C.im - A.im) - (B.im - A.im) * (C.re - A.re);
    if (aire2 === 0 || Math.abs(aire2) < 6) continue; // alignés ou triangle trop aplati
    if (ab === ac || ab === bc || ac === bc) continue;
    if (ab + ac === bc || ab + bc === ac || ac + bc === ab) continue;
    return assembler("quelconque", { A, B, C }, "aucun", "aucun");
  }
}

export function construireFamilleA(sousTypeForce?: SousTypeTrianglesA): ExerciceTrianglesA {
  switch (sousTypeForce ?? tirerParmi(SOUS_TYPES)) {
    case "isocele":
      return construireIsocele();
    case "rectangle":
      return construireRectangle();
    case "isoceleRectangle":
      return construireIsoceleRectangle();
    case "quelconque":
      return construireQuelconque();
  }
}
