import type { ExerciceProbabiliteHypergeometrique, FamilleProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import { construireAucun, construireExactement, construireFamilleA, construireTous } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";

export { construireAucun, construireExactement, construireFamilleA, construireTous, construireFamilleB, construireFamilleC };

/**
 * Couche A (6e) — point d'entrée `6gen47` ("Probabilité hypergéométrique (tirage sans remise)"),
 * chapitre "Analyse combinatoire". Tirage à 2 niveaux (mirroir `generateurs6e/
 * denombrementFondamental/index.ts`, 6gen43) : la FAMILLE (A à C) est tirée ÉQUIPROBABLE en
 * premier, puis, pour la famille A, le sous-type est tiré ÉQUIPROBABLE ensuite (familles B et C
 * n'ont qu'une seule forme chacune).
 */

export type IdVarianteProbabiliteHypergeometrique = "A_aucun" | "A_tous" | "A_exactement" | "B_ordreComposition" | "C_lotoBonus";

export const CATALOGUE_VARIANTES: { id: IdVarianteProbabiliteHypergeometrique; label: string }[] = [
  { id: "A_aucun", label: "A — Hypergéométrique de base : aucun succès (k=0)" },
  { id: "A_tous", label: "A — Hypergéométrique de base : tous des succès (k=n)" },
  { id: "A_exactement", label: "A — Hypergéométrique de base : exactement k succès" },
  { id: "B_ordreComposition", label: "B — Contraste ordre vs composition (urne à 2 couleurs)" },
  { id: "C_lotoBonus", label: "C — Hypergéométrique à 2 catégories croisées (loto + bonus)" },
];

export function construireAvecVarianteId(id: IdVarianteProbabiliteHypergeometrique): ExerciceProbabiliteHypergeometrique {
  switch (id) {
    case "A_aucun":
      return construireAucun();
    case "A_tous":
      return construireTous();
    case "A_exactement":
      return construireExactement();
    case "B_ordreComposition":
      return construireFamilleB();
    case "C_lotoBonus":
      return construireFamilleC();
  }
}

const FAMILLES: FamilleProbabiliteHypergeometrique[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleProbabiliteHypergeometrique, () => ExerciceProbabiliteHypergeometrique> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
};

export function genererExerciceProbabiliteHypergeometrique(): ExerciceProbabiliteHypergeometrique {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
