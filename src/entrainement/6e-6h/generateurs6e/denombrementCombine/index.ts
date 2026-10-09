import type { ExerciceDenombrementCombine, FamilleDenombrementCombine } from "../../core6e/denombrementCombine.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB, construireMemeContrainte, construirePartitionComplementaire, construirePoolsSepares, construireRoleDistingue } from "./familleB";
import { construireComparaison, construireFamilleC, construireRepetition } from "./familleC";
import { construireContrainteRiche, construireCoupleIndissociable, construireExclusionPaire, construireFamilleD } from "./familleD";

export { construireFamilleA } from "./familleA";
export { construireFamilleB, construireMemeContrainte, construirePartitionComplementaire, construirePoolsSepares, construireRoleDistingue } from "./familleB";
export { construireComparaison, construireFamilleC, construireRepetition } from "./familleC";
export { construireContrainteRiche, construireCoupleIndissociable, construireExclusionPaire, construireFamilleD } from "./familleD";

/**
 * Couche A (6e) — point d'entrée `6gen44` ("Dénombrement combiné et sélections contraintes"), 2ᵉ
 * générateur du chapitre "Analyse combinatoire". Tirage à 2 niveaux (mirroir
 * `denombrementFondamental/index.ts`, 6gen43) : la FAMILLE (A à D) est tirée ÉQUIPROBABLE en
 * premier, puis le sous-type de la famille tirée est tiré ÉQUIPROBABLE ensuite.
 */

export type IdVarianteDenombrementCombine = "A_multinomial" | "B_roleDistingue" | "B_poolsSepares" | "B_memeContrainte" | "B_partitionComplementaire" | "C_repetition" | "C_comparaison" | "D_exclusionPaire" | "D_coupleIndissociable" | "D_contrainteRiche";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementCombine; label: string }[] = [
  { id: "A_multinomial", label: "A — Répartition en groupes de tailles données (multinomiale)" },
  { id: "B_roleDistingue", label: "B — Rôle distingué + reste en combinaison" },
  { id: "B_poolsSepares", label: "B — Pools séparés indépendants (ET)" },
  { id: "B_memeContrainte", label: "B — Même contrainte sur 2 groupes (OU)" },
  { id: "B_partitionComplementaire", label: "B — Partition en 2 groupes complémentaires" },
  { id: "C_repetition", label: "C — Combinaisons avec répétition" },
  { id: "C_comparaison", label: "C — Comparaison discernable/indiscernable" },
  { id: "D_exclusionPaire", label: "D — Exclusion de paire (soustraction)" },
  { id: "D_coupleIndissociable", label: "D — Couple indissociable (addition)" },
  { id: "D_contrainteRiche", label: "D — Contrainte plus riche (2 catégories)" },
];

export function construireAvecVarianteId(id: IdVarianteDenombrementCombine): ExerciceDenombrementCombine {
  switch (id) {
    case "A_multinomial":
      return construireFamilleA();
    case "B_roleDistingue":
      return construireRoleDistingue();
    case "B_poolsSepares":
      return construirePoolsSepares();
    case "B_memeContrainte":
      return construireMemeContrainte();
    case "B_partitionComplementaire":
      return construirePartitionComplementaire();
    case "C_repetition":
      return construireRepetition();
    case "C_comparaison":
      return construireComparaison();
    case "D_exclusionPaire":
      return construireExclusionPaire();
    case "D_coupleIndissociable":
      return construireCoupleIndissociable();
    case "D_contrainteRiche":
      return construireContrainteRiche();
  }
}

const FAMILLES: FamilleDenombrementCombine[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleDenombrementCombine, () => ExerciceDenombrementCombine> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
};

export function genererExerciceDenombrementCombine(): ExerciceDenombrementCombine {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
