import type { ExerciceCerclesA } from "../../core6e/cercles.types";
import type { Point } from "./geometrie";
import { resoudreSysteme3x3, tirerEntier, tirerParmi } from "./geometrie";

/**
 * Couche A (6e) — génération, famille A ("Cercle par 3 points") de `6gen55`. Construction PAR
 * CONSTRUCTION INVERSE pour garantir des données propres : on choisit d'abord un centre entier
 * caché (h,k) et un r² admettant plusieurs représentations entières `dx²+dy²=r²` (banque
 * `BANQUE_R_CARRE`), puis on tire 3 points DISTINCTS parmi les points réseau du cercle — 3 points
 * distincts sur un même cercle sont TOUJOURS non alignés (une droite coupe un cercle en au plus 2
 * points), donc la contrainte "non alignés" de l'énoncé est satisfaite par construction, jamais
 * vérifiée après coup.
 *
 * D,E,F sont ensuite retrouvés en RÉSOLVANT le système 3x3 (`resoudreSysteme3x3`, la vraie méthode
 * que l'élève doit suivre), jamais directement depuis (h,k,r²) — `familleA.test.ts` vérifie que les
 * deux méthodes coïncident (cohérence croisée).
 */

const BANQUE_R_CARRE = [25, 50, 65, 85, 100, 125, 169, 200];

function pointsSurCercle(rCarre: number): { dx: number; dy: number }[] {
  const pts: { dx: number; dy: number }[] = [];
  const rayonMax = Math.floor(Math.sqrt(rCarre));
  for (let dx = -rayonMax; dx <= rayonMax; dx++) {
    const dySq = rCarre - dx * dx;
    const dy = Math.round(Math.sqrt(dySq));
    if (dy * dy === dySq) {
      pts.push({ dx, dy });
      if (dy !== 0) pts.push({ dx, dy: -dy });
    }
  }
  return pts;
}

function tirer3Distincts<T>(candidats: readonly T[]): [T, T, T] {
  const copie = [...candidats];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return [copie[0], copie[1], copie[2]];
}

export function construireFamilleA(): ExerciceCerclesA {
  const h = tirerEntier(-6, 6);
  const k = tirerEntier(-6, 6);
  const rCarre = tirerParmi(BANQUE_R_CARRE);
  const pts = pointsSurCercle(rCarre);
  const [p1, p2, p3] = tirer3Distincts(pts);
  const A: Point = { x: h + p1.dx, y: k + p1.dy };
  const B: Point = { x: h + p2.dx, y: k + p2.dy };
  const C: Point = { x: h + p3.dx, y: k + p3.dy };

  const equationPour = (P: Point): [number, number, number] => [P.x, P.y, 1];
  const secondMembre = (P: Point): number => -(P.x * P.x + P.y * P.y);

  const sol = resoudreSysteme3x3([equationPour(A), equationPour(B), equationPour(C)], [secondMembre(A), secondMembre(B), secondMembre(C)]);
  if (!sol) return construireFamilleA(); // défense en profondeur (déterminant nul) — ne devrait jamais arriver, 3 points distincts sur un cercle sont non alignés.

  const { D, E, F } = sol;
  const centreX = -D / 2;
  const centreY = -E / 2;
  const rayon = Math.sqrt(D * D / 4 + (E * E) / 4 - F);

  return { famille: "A", A, B, C, D, E, F, centreX, centreY, rayon };
}
