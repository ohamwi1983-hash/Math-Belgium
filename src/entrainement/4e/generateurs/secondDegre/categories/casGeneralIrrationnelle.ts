import type { Exercice } from "../../../core/generateur.types";
import { racinesDistinctesNonOpposees, tirerK } from "../aleatoire";

/**
 * Variante irrationnelle de "cas général" : équation de base a(y-r1)(y-r2)=0 avec a=1 (racines
 * rationnelles r1,r2), mise à l'échelle x=√k·y → x²+B√k·x+Ck=0, racines r1√k et r2√k.
 * Δ = k·(r1-r2)² reste toujours rationnel malgré les racines irrationnelles — le champ 1 (Δ)
 * n'a donc pas besoin de gabarit, contrairement aux 3 autres familles.
 */
export function construireCasGeneralIrrationnelle(): Exercice {
  const k = tirerK();
  const [r1, r2] = racinesDistinctesNonOpposees(-6, 6);

  const a = 1;
  const B = -(r1 + r2);
  const C = r1 * r2;
  const b = B * Math.sqrt(k);
  const c = C * k;
  const delta = k * (r1 - r2) * (r1 - r2);

  const racinesCoefficients: [number, number] = r1 < r2 ? [r1, r2] : [r2, r1];
  const racines: [number, number] = [racinesCoefficients[0] * Math.sqrt(k), racinesCoefficients[1] * Math.sqrt(k)];

  return {
    categorie: "cas_general",
    enonce: { a, b, c },
    solution: {
      delta,
      racines,
      racinesExactes: false,
    },
    formeAffichage: "canonique",
    irrationnel: { k, B, racinesCoefficients },
  };
}
