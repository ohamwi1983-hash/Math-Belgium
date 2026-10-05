import type { ExerciceDeriveeC } from "../../../core6e/deriveesCyclometriques.types";
import { ARCFONCTIONS_BORNEES, tirerParmi } from "../aleatoire";
import { MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const K = [1, 2, 3] as const;
const A = [2, 3, 4] as const;

/** Famille C — f(x) = k·arcfonction(ax) / √(1-(ax)²), arcfonction∈{arcsin,arccos}. */
export function construireC(): ExerciceDeriveeC {
  const arcfonction = tirerParmi(ARCFONCTIONS_BORNEES);
  const k = tirerParmi(K);
  const a = tirerParmi(A);

  const pointsEchantillonnage = chercherPointsValides((x) => Math.abs(a * x) < MARGE_ARCFONCTION);
  if (pointsEchantillonnage === null) throw new Error("construireC : aucune fenêtre de domaine valide (ne devrait jamais arriver, a∈{2,3,4} borné)");

  return { famille: "C", arcfonction, k, a, pointsEchantillonnage };
}
