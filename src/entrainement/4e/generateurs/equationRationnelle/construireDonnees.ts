import type { Exercice } from "../../core/generateur.types";
import { randomInt } from "../secondDegre/aleatoire";

const P_MIN = -6;
const P_MAX = 6;

/** Mélange de Fisher-Yates — ordre d'essai des candidats p (spec section 1, points 2 et 5). */
function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function candidatsP(exclues: number[]): number[] {
  const candidats: number[] = [];
  for (let p = P_MIN; p <= P_MAX; p++) {
    if (!exclues.includes(p)) candidats.push(p);
  }
  return candidats;
}

/** "Raisonnable" (spec section 1, point 5) : un entier non nul — A est en réalité toujours entier
 * ici (p,q,c entiers), et toujours non nul puisque p est exclu des racines (voir plus bas). */
function estRaisonnable(A: number): boolean {
  return Number.isInteger(A) && A !== 0;
}

/**
 * Construit p (CE), q et A pour l'équation affichée A/(x-p) = x-q, à partir d'une équation du
 * second degré déjà isolée x²+bx+c=0 (section 1 de la spec) :
 *   - p choisi parmi de petits entiers, en excluant explicitement les racines de l'équation
 *     (limite assumée de cette V1 — voir core/equationRationnelle.types.ts) ;
 *   - q = -b - p (dérivé de p+q = -b) ;
 *   - A = p·q - c (dérivé de c = p·q - A).
 * p²+bp+c est le polynôme de l'équation isolée évalué en p, qui ne s'annule qu'aux racines —
 * puisque p en est exclu, A = -(p²+bp+c) est donc toujours non nul par construction ; la boucle
 * de secours ci-dessous n'est déclenchée que si aucun candidat de la plage n'est disponible.
 */
export function construireDonnees(equationIsolee: Exercice): { p: number; q: number; A: number } {
  const { b, c } = equationIsolee.enonce;
  const candidats = melanger(candidatsP(equationIsolee.solution.racines));

  for (const p of candidats) {
    const q = -b - p;
    const A = p * q - c;
    if (estRaisonnable(A)) return { p, q, A };
  }

  throw new Error("construireDonnees : aucune valeur de p raisonnable trouvée dans la plage");
}
