import type { ExercicePDRT_G, ExercicePDRT_G_CentreCote, ExercicePDRT_G_SommetDiagonale, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { ligneParDeuxPoints, perpendiculairePassantPar, rotation90 } from "./geometrie";

/**
 * Couche A (6e) — famille G de `6gen54` : sommets d'un carré, 2 sous-types.
 *
 * **Paramétrage "centre + 1 vecteur", sans trigonométrie ni racine carrée** : pour un carré de
 * centre `O` et un vecteur `v` allant de `O` à un sommet, les 4 sommets sont `O+v`, `O+rot90(v)`,
 * `O-v`, `O-rot90(v)` (`rot90` = rotation de 90°, qui préserve la longueur ET l'orthogonalité —
 * exactement les 2 propriétés voulues pour 2 rayons consécutifs d'un carré). Tout reste dans les
 * entiers dès que `v` l'est.
 *
 * - **"sommetDiagonale"** : A, B, D, C = les 4 sommets avec `A=O+rot90(v)`, `B=O+v`, `D=O-v`,
 *   `C=O-rot90(v)` — A et C forment une diagonale, B et D l'autre (= la droite BD, donnée). Fait
 *   clé (démontré dans `docs/historique-6e.md`) : `O` est exactement le pied de la perpendiculaire
 *   abaissée de `A` sur (BD) — jamais besoin de connaître `v` pour le retrouver.
 * - **"centreCote"** : centre `P`, vecteur `e` = moitié du côté [A,B]. `M=P+rot90(e)` (milieu de
 *   [A,B], à l'apothème de `e` de `P`), `A=M-e`, `B=M+e`, et les 2 sommets opposés (diagonale)
 *   `C=2P-A`, `D=2P-B`. Fait clé : `M` est le pied de la perpendiculaire abaissée de `P` sur (AB),
 *   et le second sommet `A` se retrouve par `A = M - rot(-90)(M-P)` (aucune racine carrée).
 */

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

function vecteurNonNul(): { x: number; y: number } {
  let v: { x: number; y: number };
  do {
    v = { x: tirerEntier(-5, 5), y: tirerEntier(-5, 5) };
  } while (v.x === 0 && v.y === 0);
  return v;
}

export function construireSommetDiagonale(): ExercicePDRT_G_SommetDiagonale {
  const O = pointAleatoire();
  const v = vecteurNonNul();
  const rv = rotation90(v);
  const B: Point = { x: O.x + v.x, y: O.y + v.y };
  const D: Point = { x: O.x - v.x, y: O.y - v.y };
  const A: Point = { x: O.x + rv.x, y: O.y + rv.y };
  const C: Point = { x: O.x - rv.x, y: O.y - rv.y };
  const droiteBD = ligneParDeuxPoints(B, D);
  const perpendiculaire = perpendiculairePassantPar(droiteBD, A);
  return { famille: "G", sousType: "sommetDiagonale", A, B, C, D, O, droiteBD, perpendiculaire };
}

export function construireCentreCote(): ExercicePDRT_G_CentreCote {
  const P = pointAleatoire();
  const e = vecteurNonNul();
  const re = rotation90(e);
  const M: Point = { x: P.x + re.x, y: P.y + re.y };
  const A: Point = { x: M.x - e.x, y: M.y - e.y };
  const B: Point = { x: M.x + e.x, y: M.y + e.y };
  const C: Point = { x: 2 * P.x - A.x, y: 2 * P.y - A.y };
  const D: Point = { x: 2 * P.x - B.x, y: 2 * P.y - B.y };
  const droiteAB = ligneParDeuxPoints(A, B);
  const perpendiculaire = perpendiculairePassantPar(droiteAB, P);
  return { famille: "G", sousType: "centreCote", A, B, C, D, P, M, droiteAB, perpendiculaire };
}

export function construireFamilleG(): ExercicePDRT_G {
  return tirerParmi([construireSommetDiagonale, construireCentreCote] as const)();
}
