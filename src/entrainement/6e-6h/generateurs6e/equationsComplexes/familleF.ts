import type { ExerciceFamilleF } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille F ("Quartique générale, racine rationnelle et division") de
 * `6gen36`. az⁴+bz³+cz²+dz+e=0, coefficients RÉELS entiers, admettant 2 racines rationnelles r1,r2
 * (entiers simples, distincts) et un facteur quadratique restant à discriminant négatif (racines
 * p±qi, q≠0).
 *
 * ============================================================================
 * **Construction À L'ENVERS depuis r1,r2,p,q — développement complet, jamais un tirage direct de
 * a,b,c,d,e**
 * ============================================================================
 * (z-r1)(z-r2) = z²+P1·z+P0, avec P1=-(r1+r2), P0=r1·r2.
 * (z-(p+qi))(z-(p-qi)) = z²-2pz+(p²+q²) = z²+Q1·z+Q0, avec Q1=-2p, Q0=p²+q².
 * Produit des 2 facteurs quadratiques (coefficients réels, TOUJOURS entiers puisque P0,P1,Q0,Q1 le
 * sont) :
 *   (z²+P1z+P0)(z²+Q1z+Q0) = z⁴+(P1+Q1)z³+(P0+Q0+P1Q1)z²+(P1Q0+P0Q1)z+P0Q0
 * Le polynôme complet est ce produit multiplié par le coefficient dominant "aCoef" (entier non
 * nul) — TOUJOURS un quartique à coefficients entiers exacts.
 *
 * ============================================================================
 * **Écrans 2/3 — quotients par division synthétique (Horner), coefficients TOUJOURS entiers
 * exacts** (r1,r2 sont par construction des racines EXACTES du quartique/cubique divisé — reste
 * de division toujours nul, vérifié explicitement par `familleF.test.ts`)
 * ============================================================================
 */

const R_MIN = -4;
const R_MAX = 4;
const PQ_MIN = -4;
const PQ_MAX = 4;

/** Division synthétique (Horner) : divise le polynôme `coefs` (du degré le plus haut au plus bas)
 * par (z-racine). Retourne le quotient (un degré de moins) — le reste n'est PAS retourné (garanti
 * nul par construction ici, vérifié par les tests). */
function divisionSynthetique(coefs: number[], racine: number): number[] {
  const quotient: number[] = [coefs[0]];
  for (let i = 1; i < coefs.length - 1; i++) {
    quotient.push(quotient[i - 1] * racine + coefs[i]);
  }
  return quotient;
}

function resteDivisionSynthetique(coefs: number[], racine: number): number {
  let v = coefs[0];
  for (let i = 1; i < coefs.length; i++) v = v * racine + coefs[i];
  return v;
}

export function construireFamilleF(): ExerciceFamilleF {
  let r1 = 0;
  let r2 = 0;
  do {
    r1 = tirerEntierNonNul(R_MIN, R_MAX);
    r2 = tirerEntierNonNul(R_MIN, R_MAX);
  } while (r1 === r2);
  const p = tirerEntier(PQ_MIN, PQ_MAX);
  const q = tirerEntierNonNul(PQ_MIN, PQ_MAX);
  const aCoef = tirerParmi([1, 1, 1, 2] as const);

  const P1 = -(r1 + r2);
  const P0 = r1 * r2;
  const Q1 = -2 * p;
  const Q0 = p * p + q * q;

  const c3 = P1 + Q1;
  const c2 = P0 + Q0 + P1 * Q1;
  const c1 = P1 * Q0 + P0 * Q1;
  const c0 = P0 * Q0;

  const a = aCoef;
  const b = aCoef * c3;
  const c = aCoef * c2;
  const d = aCoef * c1;
  const e = aCoef * c0;

  const quartique = [a, b, c, d, e];
  const cubique = divisionSynthetique(quartique, r1);
  const quotientCubique: [number, number, number, number] = [cubique[0], cubique[1], cubique[2], cubique[3]];

  const quadratique = divisionSynthetique(cubique, r2);
  const quotientQuadratique: [number, number, number] = [quadratique[0], quadratique[1], quadratique[2]];

  const racines: ExerciceFamilleF["racines"] = [
    { re: r1, im: 0 },
    { re: r2, im: 0 },
    { re: p, im: q },
    { re: p, im: -q },
  ];

  // Garde-fou : reste nul aux 2 divisions (garanti algébriquement, jamais silencieusement faux).
  if (resteDivisionSynthetique(quartique, r1) !== 0 || resteDivisionSynthetique(cubique, r2) !== 0) {
    throw new Error("construireFamilleF : reste non nul — incohérence de construction");
  }

  return { famille: "F", a, b, c, d, e, r1, r2, p, q, quotientCubique, quotientQuadratique, racines };
}
