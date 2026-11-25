import type { ExerciceProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import { construireAucun, construireExactement, construireTous } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { tirerParmi } from "./aleatoire";

export { construireAucun, construireExactement, construireTous, construireFamilleB, construireFamilleC };

/**
 * Couche A (6e) — `6gen47` « Probabilité hypergéométrique » (6e ch. 7, § 5). Catalogue : ordre figé
 * (codes imprimés). Tirage libre : chaque variante à parts égales.
 */

export type IdVarianteProbabiliteHypergeometrique = "A_aucun" | "A_tous" | "A_exactement" | "B_ordreComposition" | "C_lotoBonus";

export const CATALOGUE_VARIANTES: { id: IdVarianteProbabiliteHypergeometrique; label: string }[] = [
  { id: "A_aucun", label: "A — Hypergéométrique : aucun succès (k = 0)" },
  { id: "A_tous", label: "A — Hypergéométrique : que des succès (k = n)" },
  { id: "A_exactement", label: "A — Hypergéométrique : exactement k succès" },
  { id: "B_ordreComposition", label: "B — Ordre ou composition (urne à deux couleurs)" },
  { id: "C_lotoBonus", label: "C — Deux tirages indépendants (loterie et bonus)" },
];

const CONSTRUCTEURS: Record<IdVarianteProbabiliteHypergeometrique, () => ExerciceProbabiliteHypergeometrique> = {
  A_aucun: construireAucun,
  A_tous: construireTous,
  A_exactement: construireExactement,
  B_ordreComposition: construireFamilleB,
  C_lotoBonus: construireFamilleC,
};

export function construireAvecVarianteId(id: IdVarianteProbabiliteHypergeometrique): ExerciceProbabiliteHypergeometrique {
  return CONSTRUCTEURS[id]();
}

export function genererExerciceProbabiliteHypergeometrique(): ExerciceProbabiliteHypergeometrique {
  return CONSTRUCTEURS[tirerParmi(CATALOGUE_VARIANTES).id]();
}
