import type { ExerciceDeriveeD, OrientationFamilleD } from "../../../core6e/deriveesCyclometriques.types";
import { tirerEntier, tirerParmi } from "../aleatoire";
import { MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;
const A = [1, 2, 3] as const;
const ORIENTATIONS: readonly OrientationFamilleD[] = ["sinSurCos", "cosSurSin"];

/** Famille D — f(x) = arcsin(u)/arccos(u) ou l'inverse, u=ax+b, même argument des deux côtés. */
export function construireD(): ExerciceDeriveeD {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const orientation = tirerParmi(ORIENTATIONS);
    const a = tirerParmi(A);
    const b = tirerEntier(-3, 3);

    const pointsEchantillonnage = chercherPointsValides((x) => Math.abs(a * x + b) < MARGE_ARCFONCTION);
    if (pointsEchantillonnage === null) continue;

    return { famille: "D", orientation, a, b, pointsEchantillonnage };
  }
  throw new Error("construireD : aucune combinaison valide trouvée après retirage");
}
