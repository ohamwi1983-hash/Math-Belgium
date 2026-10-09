import type { ExerciceLongueurArcB } from "../../core6e/longueurArc.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Substitution t=√(x²+k²), bornes construites") de
 * `6gen28`. f(x)=k·ln(x), f'(x)=k/x, 1+f'(x)²=(x²+k²)/x².
 *
 * **Construction "depuis les cibles t"** (voir en-tête `core6e/longueurArc.types.ts`) : k tiré
 * d'abord, PUIS deux entiers t1<t2 (tous deux >k, pour que a=√(t1²−k²) et b=√(t2²−k²) soient
 * réels) — les bornes x réelles sont DÉDUITES ensuite, garantissant que la substitution
 * t=√(x²+k²) tombe EXACTEMENT sur t1/t2 aux bornes (jamais une approximation).
 *
 * `integrandeEnTReference`/`primitiveEnTReference` — décomposition en éléments simples classique :
 * t²/(t²−k²) = 1 + k²/(t²−k²), et 1/(t²−k²) = 1/(2k)·[1/(t−k) − 1/(t+k)], d'où la primitive
 * t + (k/2)·ln|(t−k)/(t+k)| + C (réutilise le même patron que la famille G de 6gen23,
 * "décomposition en éléments simples" — voir `generateurs6e/calculPrimitives/familles/G.ts` pour
 * le précédent, jamais importé ici : ce dénominateur t²−k² est fixe/construit à la main, pas issu
 * d'un tirage aléatoire générique comme celui de 6gen23).
 */

export function construireFamilleLongueurArcB(): ExerciceLongueurArcB {
  const k = tirerEntier(1, 3);
  let t1 = tirerEntier(k + 1, k + 5);
  let t2 = tirerEntier(k + 1, k + 5);
  while (t2 === t1) t2 = tirerEntier(k + 1, k + 5);
  if (t1 > t2) [t1, t2] = [t2, t1];
  const a = Math.sqrt(t1 * t1 - k * k);
  const b = Math.sqrt(t2 * t2 - k * k);
  return {
    famille: "B",
    k,
    t1,
    t2,
    a,
    b,
    integrandeEnTReference: (t) => (t * t) / (t * t - k * k),
    primitiveEnTReference: (t) => t + (k / 2) * Math.log(Math.abs((t - k) / (t + k))),
  };
}
