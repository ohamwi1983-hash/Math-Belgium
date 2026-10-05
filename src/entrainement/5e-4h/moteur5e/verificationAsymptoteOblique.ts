/**
 * Couche B (5e) — vérification pour 5gen21 ("Asymptote oblique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT `diagnostiquerValeurArcSecteur` (5gen6) pour tout champ "nombre simple".
 * RÉPLIQUE localement (jamais importée) le mécanisme "équivalence algébrique par échantillonnage de
 * points" déjà établi pour 5gen20 (`verificationLimites.ts`).
 *
 * `diagnostiquerQuotient`/`diagnostiquerNombre` sont réutilisées TELLES QUELLES par plusieurs autres
 * générateurs 5e (5gen23/5gen24/5gen26/5gen28/5gen29/5gen31, Couche B↔B autorisé) — signatures
 * INCHANGÉES par cette refonte.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";

export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

/** `coeffs[i]` = coefficient de x^i. */
function evaluerPolynome(coeffs: number[], x: number): number {
  let acc = 0;
  for (let d = 0; d < coeffs.length; d++) acc += coeffs[d] * x ** d;
  return acc;
}

/** Équivalence algébrique en x, échantillonnée sur quelques points (dont certains peuvent être
 * exclus — ex. un pôle de D(x), où une forme développée ax+b+c/D(x) n'est pas définie). */
function diagnostiquerExpressionEnX(texte: string, evaluerCible: (x: number) => number, pointsExclus: number[] = []): StatutVerification {
  try {
    const points = [0, 1, 2, -1, 3, -2].filter((p) => !pointsExclus.includes(p));
    for (const x of points) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - evaluerCible(x)) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Écrans "diviserEuclidienne" (champ quotient) / "conclureEquationAsymptote" — le quotient ax+b,
 * réutilisée telle quelle par les 2 écrans (même cible, indépendamment de la variante/technique). */
export function diagnostiquerQuotient(texte: string, a: number, b: number): StatutVerification {
  return diagnostiquerExpressionEnX(texte, (x) => a * x + b);
}

/** Écran "ecrireFormeDeveloppee" (variante "divisionEuclidienne") — ax+b+c/D(x), jamais échantillonné
 * à un point qui annule D(x) (pôle, indéfini des deux côtés de l'équation à vérifier, ne discrimine
 * rien) — candidats filtrés dynamiquement (contrairement à l'ancien "x=k" fixe), fonctionne aussi
 * bien pour D(x) de degré 1 (un pôle possible) que de degré 2 (aucun, par construction). */
export function diagnostiquerFormeDeveloppee(texte: string, a: number, b: number, c: number, coeffsD: number[]): StatutVerification {
  const candidats = [0, 1, 2, -1, 3, -2];
  const pointsExclus = candidats.filter((x) => Math.abs(evaluerPolynome(coeffsD, x)) < 1e-9);
  return diagnostiquerExpressionEnX(texte, (x) => a * x + b + c / evaluerPolynome(coeffsD, x), pointsExclus);
}
