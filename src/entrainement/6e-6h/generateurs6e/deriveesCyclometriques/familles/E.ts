import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { ExerciceDeriveeE, GTypeFamilleE } from "../../../core6e/deriveesCyclometriques.types";
import { ARCFONCTIONS, tirerEntier, tirerParmi } from "../aleatoire";
import { EPSILON_DENOMINATEUR, MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;
const G_TYPES: readonly GTypeFamilleE[] = ["racine", "carre"];

/** `w = arcfonction(v)` — inlinée ici plutôt qu'importée de `moteur6e/derivationCyclometrique.ts`
 * (règle d'architecture non négociable, `src/generateurs6e/` n'importe jamais `src/moteur6e/`) :
 * simple calcul numérique, utilisé UNIQUEMENT pour la recherche de points valides (Couche A),
 * jamais pour une formule de dérivée. */
function calculerW(arcfonction: Arcfonction, v: number): number {
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
 * Famille E — f(x) = g(arcfonction(v(x))), v(x)=a·x, g∈{racine,carre}. Pour g="racine", `w`
 * (l'intérieur de la racine) doit rester STRICTEMENT positif — arcsin/arctan(v) n'est positif que
 * pour v>0 (fonctions impaires), donc le point d'échantillonnage doit alors être du même signe que
 * `a` ; arccos(v) reste toujours positif sur `(-1;1)`, jamais de restriction supplémentaire pour
 * cette arcfonction.
 */
export function construireE(): ExerciceDeriveeE {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const arcfonction = tirerParmi(ARCFONCTIONS);
    const gType = tirerParmi(G_TYPES);
    const a = tirerEntier(1, 4);

    const pointsEchantillonnage = chercherPointsValides((x) => {
      const v = a * x;
      if (Math.abs(v) >= MARGE_ARCFONCTION) return false;
      if (gType === "racine" && calculerW(arcfonction, v) < EPSILON_DENOMINATEUR) return false;
      return true;
    });
    if (pointsEchantillonnage === null) continue;

    return { famille: "E", arcfonction, gType, a, pointsEchantillonnage };
  }
  throw new Error("construireE : aucune combinaison valide trouvée après retirage");
}
