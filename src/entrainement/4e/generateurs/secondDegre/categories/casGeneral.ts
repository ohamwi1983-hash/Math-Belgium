import type { Exercice } from "../../../core/generateur.types";
import { autreRacineCasGeneral, randomInt, racinesDistinctesNonOpposees } from "../aleatoire";

/**
 * a(x - r1)(x - r2) = ax² + bx + c, avec b = -a·(r1+r2) et c = a·r1·r2.
 * r1 ≠ r2 pour éviter Δ = 0 (produit remarquable), tous deux non nuls pour éviter c = 0
 * (mise en évidence), et non opposés pour éviter b = 0 (binôme conjugué).
 * Δ garanti carré parfait : Δ = a²(r1-r2)².
 * `racineImposee` (générateur "Simplifier") fixe r1 à cette valeur ; `racinesInterdites` exclut
 * en plus des valeurs explicites pour r2 (ex: seconde racine déjà utilisée par l'autre polynôme
 * de la fraction, pour éviter le cas dégénéré décrit dans la spec). `aImpose` (générateur
 * "L'inconnue au dénominateur") fixe a au lieu de le tirer — utilisé pour générer une équation
 * monique (a=1), orthogonal aux deux options précédentes.
 */
export function construireCasGeneral(options?: {
  racineImposee?: number;
  racinesInterdites?: number[];
  aImpose?: number;
}): Omit<Exercice, "formeAffichage"> {
  const a = options?.aImpose ?? randomInt(1, 4);
  const [r1, r2] =
    options?.racineImposee !== undefined
      ? [options.racineImposee, autreRacineCasGeneral(options.racineImposee, options?.racinesInterdites ?? [], -6, 6)]
      : racinesDistinctesNonOpposees(-6, 6);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const delta = b * b - 4 * a * c;

  return {
    categorie: "cas_general",
    enonce: { a, b, c },
    solution: {
      delta,
      racines: r1 < r2 ? [r1, r2] : [r2, r1],
      racinesExactes: true,
    },
  };
}
