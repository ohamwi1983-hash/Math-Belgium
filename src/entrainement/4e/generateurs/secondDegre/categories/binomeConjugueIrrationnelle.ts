import type { Exercice } from "../../../core/generateur.types";
import { randomInt, tirerK } from "../aleatoire";

/**
 * Variante irrationnelle de "binôme conjugué" : équation de base y²-D²=0 (a=1, racines ±D),
 * mise à l'échelle x=√k·y → x²-D²k=0, racines ±D√k. D>0 (magnitude, le signe est fixé par le
 * gabarit affiché à l'élève : "(x-D√k)(x+D√k)").
 */
export function construireBinomeConjugueIrrationnelle(): Exercice {
  const k = tirerK();
  const D = randomInt(1, 6);

  const a = 1;
  const B = 0;
  const b = 0;
  const c = -D * D * k;

  const racinesCoefficients: [number, number] = [-D, D];
  const racines: [number, number] = [-D * Math.sqrt(k), D * Math.sqrt(k)];

  const magnitude = D === 1 ? "" : `${D}`;

  return {
    categorie: "binome_conjugue",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: `(x - ${magnitude}\\sqrt{${k}})(x + ${magnitude}\\sqrt{${k}})`,
      racines,
      racinesExactes: false,
    },
    formeAffichage: "canonique",
    irrationnel: { k, B, champPrincipal: D, racinesCoefficients },
  };
}
