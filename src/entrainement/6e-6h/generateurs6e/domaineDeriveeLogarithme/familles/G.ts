import type { ExerciceDomaineDeriveeLogG, VarianteG } from "../../../core6e/domaineDeriveeLogarithme.types";
import { tirerParmi } from "../aleatoire";

/**
 * Famille G — dérivation logarithmique implicite, f(x)=u(x)^v(x) (3 écrans : identifier u^v, f'/f,
 * isoler f') — NOUVEAUTÉ CENTRALE. Aucun champ `domaine` (bases supposées strictement positives,
 * spec explicite). 10 variantes équiprobables, la plupart paramétrées par un entier `a` (audit 6e
 * ch. 3, point 27) — 20 exercices distincts au total.
 */
const VALEURS_A: Record<VarianteG, readonly number[]> = {
  xx: [1, 2, 3],
  xSinx: [1, 2],
  cosTan: [1, 2],
  unSurXPuissanceX: [1, 2, 3],
  sinXInvX: [1, 2],
  racineXPuissanceX: [1],
  xRacineXPuissanceX: [1],
  produit: [1, 2],
  xLnx: [1],
  affinePuissanceX: [1, 2, 3],
};
const VARIANTES_G = Object.keys(VALEURS_A) as VarianteG[];

export function construireG(): ExerciceDomaineDeriveeLogG {
  const variante = tirerParmi(VARIANTES_G);
  return { famille: "G", variante, a: tirerParmi(VALEURS_A[variante]) };
}
