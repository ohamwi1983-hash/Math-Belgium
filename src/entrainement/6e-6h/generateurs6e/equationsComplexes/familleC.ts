import type { ExerciceFamilleC, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Quadratique, discriminant réel négatif") de `6gen36`.
 * az²+bz+c=0, a,b,c RÉELS entiers, Δ=b²-4ac<0.
 *
 * ============================================================================
 * **Construction À L'ENVERS depuis 2 racines conjuguées cibles p±qi (q≠0)** — jamais a,b,c tirés
 * au hasard en espérant Δ<0
 * ============================================================================
 * Pour un couple conjugué p±qi (p,q entiers, q≠0) et un coefficient dominant "a" entier non nul :
 *   a(z-(p+qi))(z-(p-qi)) = a(z²-2pz+(p²+q²)) = a·z² - 2ap·z + a(p²+q²)
 * donc b=-2ap, c=a(p²+q²) — TOUJOURS des entiers exacts. Le discriminant vaut alors :
 *   Δ=b²-4ac = 4a²p² - 4a²(p²+q²) = -4a²q² < 0 (q≠0)  — TOUJOURS strictement négatif.
 * Et √|Δ|=√(4a²q²)=2a|q| — TOUJOURS un entier exact (jamais un radical réel à évaluer), donnant
 * les racines (-b±i√|Δ|)/(2a) = (2ap±i·2a|q|)/(2a) = p±i|q| = p±qi (à un signe près sur q, sans
 * incidence sur l'ENSEMBLE des 2 racines) — retombe EXACTEMENT sur p±qi choisi au départ. Preuve
 * testée explicitement (`familleC.test.ts`).
 */

const A_MIN = -3;
const A_MAX = 3;
const PQ_MIN = -5;
const PQ_MAX = 5;

export function construireFamilleC(): ExerciceFamilleC {
  const a = tirerEntierNonNul(A_MIN, A_MAX);
  const p = tirerEntier(PQ_MIN, PQ_MAX);
  const q = tirerEntierNonNul(PQ_MIN, PQ_MAX);

  const b = -2 * a * p;
  const c = a * (p * p + q * q);
  const delta = b * b - 4 * a * c;

  const r1: ValeurComplexe = { re: p, im: q };
  const r2: ValeurComplexe = { re: p, im: -q };
  return { famille: "C", a, b, c, delta, racines: [r1, r2] };
}
