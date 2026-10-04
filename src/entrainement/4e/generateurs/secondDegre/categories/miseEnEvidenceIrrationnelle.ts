import type { Exercice } from "../../../core/generateur.types";
import { randomNonZeroInt, tirerK } from "../aleatoire";

/**
 * Variante irrationnelle de "mise en évidence" (voir VarianteIrrationnelle) : équation de base
 * y(y+B)=0 (a=1, racines 0 et -B), mise à l'échelle x=√k·y → x(x+B√k)=0, racines 0 et -B√k.
 */
export function construireMiseEnEvidenceIrrationnelle(): Exercice {
  const k = tirerK();
  const B = randomNonZeroInt(-6, 6);

  const a = 1;
  const b = B * Math.sqrt(k);
  const c = 0;

  const racineCoeffAutre = -B;
  const racinesCoefficients: [number, number] =
    racineCoeffAutre < 0 ? [racineCoeffAutre, 0] : [0, racineCoeffAutre];
  const racines: [number, number] = [racinesCoefficients[0] * Math.sqrt(k), racinesCoefficients[1] * Math.sqrt(k)];

  const signe = B >= 0 ? "+" : "-";
  const magnitude = Math.abs(B) === 1 ? "" : `${Math.abs(B)}`;

  return {
    categorie: "mise_en_evidence",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: `x(x ${signe} ${magnitude}\\sqrt{${k}})`,
      racines,
      racinesExactes: false,
    },
    formeAffichage: "canonique",
    irrationnel: { k, B, champPrincipal: B, racinesCoefficients },
  };
}
