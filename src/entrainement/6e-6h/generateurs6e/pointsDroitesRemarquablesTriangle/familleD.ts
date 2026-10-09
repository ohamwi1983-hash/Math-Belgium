import type { Droite, ExercicePDRT_D, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier } from "./aleatoire";
import { determinant, ligneParDeuxPoints, milieu, pointSurDroite } from "./geometrie";

/**
 * Couche A (6e) — famille D de `6gen54` : A donné, droites BB' et CC' (médianes issues de B et C)
 * données, retrouver les 3 côtés du triangle.
 *
 * B est déterminé par le système { B∈(BB') ; milieu[A,B]∈(CC') } — 2 équations LINÉAIRES en (Bx,By)
 * (`eqPourB_1`=BB' elle-même, `eqPourB_2`=CC' réécrite en (Bx,By) après substitution du milieu).
 * Comme le vrai B vérifie structurellement les deux (B∈sa propre médiane ; milieu[A,B]=C', qui est
 * PAR DÉFINITION sur CC'), résoudre ce système via `intersectionDeuxDroites` (Cramer, réutilisée
 * telle quelle — un système linéaire 2×2 quelconque, pas seulement 2 droites au sens géométrique)
 * retombe EXACTEMENT sur le vrai B, sans arrondi ni fraction parasite. Analogue pour C.
 *
 * **BUG trouvé et corrigé (vérification Playwright manuelle, build de production)** : A, B, C
 * tirés à coordonnées entières QUELCONQUES rendaient `Bp`/`Cp` (milieux) parfois demi-entiers,
 * produisant des équations avec des coefficients comme `3.5` — violation de "jamais de décimal
 * pour une valeur générée" (CLAUDE.md). Fix, mirroir `familleA.ts` : A, B, C tirés à coordonnées
 * PAIRES (`pointAleatoire` multiplie par 2), qui garantit que toute somme de 2 d'entre eux — donc
 * tout milieu — reste un entier.
 */

function pointAleatoire(): Point {
  return { x: 2 * tirerEntier(-6, 6), y: 2 * tirerEntier(-6, 6) };
}

function aireDoublee(A: Point, B: Point, C: Point): number {
  return determinant({ x: B.x - A.x, y: B.y - A.y }, { x: C.x - A.x, y: C.y - A.y });
}

/** Réécrit `milieu(A,X)∈ligne` comme une équation linéaire en (Xx,Xy) — voir en-tête de fichier. */
function eqMilieuSurDroite(A: Point, ligne: Droite): Droite {
  return { a: ligne.a, b: ligne.b, c: ligne.a * A.x + ligne.b * A.y + 2 * ligne.c };
}

interface TriangleValide {
  A: Point;
  B: Point;
  C: Point;
  droiteBBp: Droite;
  droiteCCp: Droite;
}

function tirerTriangleValide(): TriangleValide {
  for (;;) {
    const A = pointAleatoire();
    const B = pointAleatoire();
    const C = pointAleatoire();
    if (Math.abs(aireDoublee(A, B, C)) < 16) continue;
    const Bp = milieu(A, C);
    const Cp = milieu(A, B);
    const droiteBBp = ligneParDeuxPoints(B, Bp);
    const droiteCCp = ligneParDeuxPoints(C, Cp);
    if (pointSurDroite(A, droiteBBp) || pointSurDroite(A, droiteCCp)) continue;
    return { A, B, C, droiteBBp, droiteCCp };
  }
}

export function construireFamilleD(): ExercicePDRT_D {
  const { A, B, C, droiteBBp, droiteCCp } = tirerTriangleValide();
  const Bp = milieu(A, C);
  const Cp = milieu(A, B);
  const eqPourB_1 = droiteBBp;
  const eqPourB_2 = eqMilieuSurDroite(A, droiteCCp);
  const eqPourC_1 = droiteCCp;
  const eqPourC_2 = eqMilieuSurDroite(A, droiteBBp);

  const droiteAB = ligneParDeuxPoints(A, B);
  const droiteAC = ligneParDeuxPoints(A, C);
  const droiteBC = ligneParDeuxPoints(B, C);

  return { famille: "D", A, B, C, Bp, Cp, droiteBBp, droiteCCp, eqPourB_1, eqPourB_2, eqPourC_1, eqPourC_2, droiteAB, droiteAC, droiteBC };
}
