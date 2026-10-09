import type { ExercicePDRT_C, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { DIRECTIONS_COPREMIERES, determinant, ligneParDeuxPoints } from "./geometrie";
import { simplifier, versNombre } from "./fraction";

/**
 * Couche A (6e) — famille C de `6gen54` : A, B donnés, aire cible k, trouver C sur une droite d
 * telle que aire(ABC)=k.
 *
 * Paramétrage `C(t)=P0+t·dir` (P0, dir entiers). Aire(t) = ½|K+M·t| où :
 *   - `M = det(B-A, dir)` — jamais nul PAR CONSTRUCTION (`d` non parallèle à (AB), sinon aucune ou
 *     une infinité de solutions) ;
 *   - `K = det(B-A, P0-A)`.
 * `|K+M·t| = 2k` équivaut à `K+M·t = ±2k`, donc TOUJOURS EXACTEMENT 2 solutions distinctes (`M≠0`,
 * `k>0` ⟹ `2k≠-2k`) — **piège central du générateur** : une seule des deux correspond au point C
 * qu'un élève visualiserait spontanément, l'autre est le symétrique par rapport à (AB). t1, t2 et
 * les 2 points C associés restent des fractions exactes (dénominateur M, souvent ≠1) — `Frac`.
 */

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

interface DonneesBase {
  A: Point;
  B: Point;
  P0: Point;
  dir: { x: number; y: number };
  K: number;
  M: number;
}

function tirerDonneesBase(): DonneesBase {
  for (;;) {
    const A = pointAleatoire();
    const B = pointAleatoire();
    if (A.x === B.x && A.y === B.y) continue;
    const dir = tirerParmi(DIRECTIONS_COPREMIERES);
    const P0 = pointAleatoire();
    const u = { x: B.x - A.x, y: B.y - A.y };
    const wA = { x: A.x - P0.x, y: A.y - P0.y };
    if (determinant(dir, wA) === 0) continue; // d passe par A
    const wB = { x: B.x - P0.x, y: B.y - P0.y };
    if (determinant(dir, wB) === 0) continue; // d passe par B
    const M = determinant(u, dir);
    if (M === 0) continue; // d parallèle à (AB) : aucune solution / une infinité
    const w = { x: P0.x - A.x, y: P0.y - A.y };
    const K = determinant(u, w);
    return { A, B, P0, dir, K, M };
  }
}

export function construireFamilleC(): ExercicePDRT_C {
  const k = tirerEntier(3, 10);
  const { A, B, P0, dir, K, M } = tirerDonneesBase();
  const d = ligneParDeuxPoints(P0, { x: P0.x + dir.x, y: P0.y + dir.y });

  const t1Frac = simplifier(2 * k - K, M);
  const t2Frac = simplifier(-2 * k - K, M);
  const solutionsTFrac = [t1Frac, t2Frac];
  const solutionsT = solutionsTFrac.map(versNombre);

  const solutionsCFrac = solutionsTFrac.map((tFrac) => ({
    x: simplifier(P0.x * tFrac.den + tFrac.num * dir.x, tFrac.den),
    y: simplifier(P0.y * tFrac.den + tFrac.num * dir.y, tFrac.den),
  }));
  const solutionsC = solutionsCFrac.map((p) => ({ x: versNombre(p.x), y: versNombre(p.y) }));

  return { famille: "C", A, B, P0, dir, d, k, K, M, solutionsTFrac, solutionsT, solutionsCFrac, solutionsC };
}
