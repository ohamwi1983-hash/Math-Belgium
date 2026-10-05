import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { ExerciceDeriveeG, SousCasFamilleG } from "../../../core6e/deriveesCyclometriques.types";
import { ARCFONCTIONS, tirerParmi } from "../aleatoire";
import { EPSILON_DENOMINATEUR, MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;
const SOUS_CAS: readonly SousCasFamilleG[] = ["h", "i"];
const K = [1, 2, 3] as const;
const C_H = [-3, -2, -1, 1, 2, 3] as const;
const C_I = [-3, -2, -1, 0, 1, 2, 3] as const;

/** `arcfonction(v)` — inlinée (même raison que `familles/E.ts`) : uniquement pour vérifier que le
 * dénominateur `arcfonction(v)` du sous-cas h reste loin de 0 à un point candidat donné. */
function calculerArcfonction(arcfonction: Arcfonction, v: number): number {
  switch (arcfonction) {
    case "arcsin":
      return Math.asin(v);
    case "arccos":
      return Math.acos(v);
    case "arctan":
      return Math.atan(v);
  }
}

/**
 * Famille G — sous-cas h : f(x)=k/arcfonction(v(x)), v(x)=x²+c ; sous-cas i :
 * f(x)=arcfonction(k/(x+c)). Tirage 50/50 entre les deux structures (piège central : ne jamais
 * confondre l'une avec l'autre).
 */
export function construireG(): ExerciceDeriveeG {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const sousCas = tirerParmi(SOUS_CAS);
    const arcfonction = tirerParmi(ARCFONCTIONS);
    const k = tirerParmi(K);

    if (sousCas === "h") {
      const c = tirerParmi(C_H);
      const pointsEchantillonnage = chercherPointsValides((x) => {
        const v = x * x + c;
        if (Math.abs(v) >= MARGE_ARCFONCTION) return false;
        // dénominateur arcfonction(v) jamais nul — arcsin(0)=0, arctan(0)=0 (jamais arccos, qui
        // ne s'annule qu'en v=1, déjà exclu par la marge ci-dessus).
        if (Math.abs(calculerArcfonction(arcfonction, v)) < EPSILON_DENOMINATEUR) return false;
        return true;
      });
      if (pointsEchantillonnage === null) continue;
      return { famille: "G", sousCas, arcfonction, k, c, pointsEchantillonnage };
    }

    const c = tirerParmi(C_I);
    const pointsEchantillonnage = chercherPointsValides((x) => {
      const denom = x + c;
      if (Math.abs(denom) < EPSILON_DENOMINATEUR) return false;
      const u = k / denom;
      return Math.abs(u) < MARGE_ARCFONCTION;
    });
    if (pointsEchantillonnage === null) continue;
    return { famille: "G", sousCas, arcfonction, k, c, pointsEchantillonnage };
  }
  throw new Error("construireG : aucune combinaison valide trouvée après retirage");
}
