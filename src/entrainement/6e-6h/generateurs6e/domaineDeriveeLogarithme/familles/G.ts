import type { ExerciceDomaineDeriveeLogG, VarianteG } from "../../../core6e/domaineDeriveeLogarithme.types";
import { tirerParmi } from "../aleatoire";

/**
 * Famille G — dérivation logarithmique implicite, f(x)=u(x)^v(x) (3 écrans : identifier u^v, f'/f,
 * isoler f') — NOUVEAUTÉ CENTRALE. Aucun champ `domaine` (bases supposées strictement positives,
 * spec explicite). Aucun paramètre numérique aléatoire — la spec ne donne aucune plage de
 * coefficients pour cette famille, chaque variante est une formule structurellement fixe. 8
 * variantes équiprobables (5 "direct" + 2 "à simplifier d'abord" + 1 "combiné produit").
 */
const VARIANTES_G: readonly VarianteG[] = ["xx", "xSinx", "cosTan", "unSurXPuissanceX", "sinXInvX", "racineXPuissanceX", "xRacineXPuissanceX", "produit"];

export function construireG(): ExerciceDomaineDeriveeLogG {
  return { famille: "G", variante: tirerParmi(VARIANTES_G) };
}
