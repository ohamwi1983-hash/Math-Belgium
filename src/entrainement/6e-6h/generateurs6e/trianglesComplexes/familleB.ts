import type { ExerciceTrianglesB, PointComplexe, SommetOAB } from "../../core6e/trianglesComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { angleAuSommetDeg, longueurEntre, pointEntier, rotation90, tirerOrdres, tirerTranslation, tirerTriangleIsocele } from "./construction";

/**
 * Couche A (6e) — génération, famille B (« triangle isocèle OAB, loi des cosinus ») de `6gen41`.
 *
 * **Audit 6e ch. 5, point 6 (décision F) — verdicts plus jamais constants** : le sommet principal
 * était TOUJOURS O (écran 2 = « isocèle en O » à chaque fois) et le triangle JAMAIS rectangle
 * (écran 3 = « pas rectangle » à chaque fois). Désormais :
 * - le sommet principal est tiré parmi O, A, B ;
 * - 1 fois sur 2 le triangle est isocèle RECTANGLE (S + (p ; q), S + (−q ; p) : angles 90°, 45°,
 *   45°), sinon isocèle non rectangle : moitié dans `BANK_ISOCELES` (côtés entiers), moitié à côtés
 *   irrationnels (sommet (0 ; h), base (±p ; 0), h ≠ p) — point 45 (décision J) : une quarantaine de
 *   jeux d'angles distincts au lieu de 10 (les triplets proportionnels donnent des triangles
 *   semblables, donc les mêmes angles).
 * Les 3 angles sont calculés par produit scalaire (`angleAuSommetDeg`) — même valeur que la loi des
 * cosinus attendue de l'élève — et vérifiés à `TOLERANCE_ANGLE_DEGRES` près (consigne : arrondir au
 * dixième de degré).
 */
export const TOLERANCE_ANGLE_DEGRES = 0.5;

const SOMMETS: SommetOAB[] = ["O", "A", "B"];

export function construireFamilleB(rectangleForce?: boolean): ExerciceTrianglesB {
  const rectangle = rectangleForce ?? tirerParmi([true, false] as const);
  const apex = tirerParmi(SOMMETS);
  const autres = SOMMETS.filter((s) => s !== apex);
  if (tirerParmi([true, false] as const)) autres.reverse();
  let locaux: { x: number; y: number }[];
  if (rectangle) {
    let p = 0;
    let q = 0;
    while (p === 0 && q === 0) {
      p = tirerEntier(1, 6);
      q = tirerEntier(0, 6);
    }
    locaux = [
      { x: 0, y: 0 },
      { x: p, y: q },
      { x: -q, y: p },
    ];
  } else if (tirerParmi([true, false] as const)) {
    const { base, hauteur } = tirerTriangleIsocele();
    locaux = [
      { x: 0, y: hauteur },
      { x: -base / 2, y: 0 },
      { x: base / 2, y: 0 },
    ];
  } else {
    // Isocèle à côtés irrationnels : sommet (0 ; h), base (±p ; 0), h ≠ p (sinon angle droit au
    // sommet). Variété des angles (point 45) : la banque entière n'a que 10 formes d'angles
    // distinctes (triplets proportionnels = triangles semblables).
    let demiBase = 0;
    let hauteur = 0;
    while (demiBase === hauteur) {
      demiBase = tirerEntier(1, 5);
      hauteur = tirerEntier(1, 7);
    }
    locaux = [
      { x: 0, y: hauteur },
      { x: -demiBase, y: 0 },
      { x: demiBase, y: 0 },
    ];
  }
  const k = tirerParmi([0, 1, 2, 3] as const);
  const { tx, ty } = tirerTranslation();
  const [p0, p1, p2] = locaux.map((p) => rotation90(p.x, p.y, k));
  const pts = {
    [apex]: pointEntier(p0.x + tx, p0.y + ty),
    [autres[0]]: pointEntier(p1.x + tx, p1.y + ty),
    [autres[1]]: pointEntier(p2.x + tx, p2.y + ty),
  } as Record<SommetOAB, PointComplexe>;
  const { O, A, B } = pts;
  return {
    famille: "B",
    O,
    A,
    B,
    OA: longueurEntre(O, A),
    OB: longueurEntre(O, B),
    AB: longueurEntre(A, B),
    sommetIsocele: apex,
    sommetRectangle: rectangle ? apex : "aucun",
    anglesDeg: { O: angleAuSommetDeg(O, A, B), A: angleAuSommetDeg(A, O, B), B: angleAuSommetDeg(B, O, A) },
    ordres: tirerOrdres(),
  };
}
