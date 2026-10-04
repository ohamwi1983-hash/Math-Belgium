import type { Exercice } from "../../../core/generateur.types";
import { randomNonZeroInt, tirerK } from "../aleatoire";

/**
 * Variante irrationnelle de "produit remarquable" : équation de base (y-r)²=0 (a=1, racine
 * double r), mise à l'échelle x=√k·y → (x-r√k)²=0, racine double r√k.
 */
export function construireProduitRemarquableIrrationnelle(): Exercice {
  const k = tirerK();
  const r = randomNonZeroInt(-6, 6);

  const a = 1;
  const B = -2 * r;
  const b = B * Math.sqrt(k);
  const c = r * r * k;

  const racinesCoefficients: [number, number] = [r, r];
  const racines: [number, number] = [r * Math.sqrt(k), r * Math.sqrt(k)];

  const signe = r >= 0 ? "-" : "+";
  const magnitude = Math.abs(r) === 1 ? "" : `${Math.abs(r)}`;

  return {
    categorie: "produit_remarquable",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: `(x ${signe} ${magnitude}\\sqrt{${k}})^2`,
      racines,
      racinesExactes: false,
    },
    formeAffichage: "canonique",
    irrationnel: { k, B, champPrincipal: r, racinesCoefficients },
  };
}
