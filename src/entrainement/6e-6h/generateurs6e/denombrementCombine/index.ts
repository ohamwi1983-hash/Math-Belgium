import type { ExerciceDenombrementCombine } from "../../core6e/denombrementCombine.types";
import { construireFamilleA } from "./familleA";
import { construireMemeContrainte, construirePartitionComplementaire, construirePoolsSepares, construireRoleDistingue } from "./familleB";
import { construireComparaison, construireRepetition } from "./familleC";
import { construireContrainteRiche, construireCoupleIndissociable, construireExclusionPaire } from "./familleD";
import { construireAnagrammes } from "./familleE";
import { tirerParmi } from "./aleatoire";

export { construireFamilleA } from "./familleA";
export { construireMemeContrainte, construirePartitionComplementaire, construirePoolsSepares, construireRoleDistingue } from "./familleB";
export { construireComparaison, construireRepetition } from "./familleC";
export { construireContrainteRiche, construireCoupleIndissociable, construireExclusionPaire } from "./familleD";
export { construireAnagrammes } from "./familleE";

/**
 * Couche A (6e) — `6gen44` « Dénombrement combiné et sélections contraintes » (6e ch. 7, § 2).
 * Catalogue : ordre figé (codes imprimés) ; « E — anagrammes » AJOUTÉE EN FIN de liste.
 * Tirage libre (audit, lot C) : chaque variante à parts égales, sauf D où le verdict (exclusion /
 * indissociable) est tiré d'abord, à parts égales.
 */

export type IdVarianteDenombrementCombine =
  | "A_multinomial"
  | "B_roleDistingue"
  | "B_poolsSepares"
  | "B_memeContrainte"
  | "B_partitionComplementaire"
  | "C_repetition"
  | "C_comparaison"
  | "D_exclusionPaire"
  | "D_coupleIndissociable"
  | "D_contrainteRiche"
  | "E_anagrammes";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementCombine; label: string }[] = [
  { id: "A_multinomial", label: "A — Répartition en groupes nommés (multinomiale)" },
  { id: "B_roleDistingue", label: "B — Rôle distingué + reste en combinaison" },
  { id: "B_poolsSepares", label: "B — Deux choix indépendants (et)" },
  { id: "B_memeContrainte", label: "B — L'un ou l'autre groupe (ou)" },
  { id: "B_partitionComplementaire", label: "B — Partage en deux groupes complémentaires" },
  { id: "C_repetition", label: "C — Combinaisons avec répétition" },
  { id: "C_comparaison", label: "C — Discernables ou indiscernables" },
  { id: "D_exclusionPaire", label: "D — Deux personnes jamais ensemble (soustraction)" },
  { id: "D_coupleIndissociable", label: "D — Ensemble ou pas du tout (addition)" },
  { id: "D_contrainteRiche", label: "D — Jamais ensemble, deux catégories" },
  { id: "E_anagrammes", label: "E — Anagrammes d'un mot à lettres répétées" },
];

const CONSTRUCTEURS: Record<IdVarianteDenombrementCombine, () => ExerciceDenombrementCombine> = {
  A_multinomial: construireFamilleA,
  B_roleDistingue: construireRoleDistingue,
  B_poolsSepares: construirePoolsSepares,
  B_memeContrainte: construireMemeContrainte,
  B_partitionComplementaire: construirePartitionComplementaire,
  C_repetition: construireRepetition,
  C_comparaison: () => construireComparaison(),
  D_exclusionPaire: construireExclusionPaire,
  D_coupleIndissociable: construireCoupleIndissociable,
  D_contrainteRiche: construireContrainteRiche,
  E_anagrammes: () => construireAnagrammes(),
};

export function construireAvecVarianteId(id: IdVarianteDenombrementCombine): ExerciceDenombrementCombine {
  return CONSTRUCTEURS[id]();
}

function construireFamilleDEquilibree(): ExerciceDenombrementCombine {
  return Math.random() < 0.5 ? tirerParmi([construireExclusionPaire, construireContrainteRiche])() : construireCoupleIndissociable();
}

const TIRAGE_LIBRE: (() => ExerciceDenombrementCombine)[] = [
  construireFamilleA,
  construireRoleDistingue,
  construirePoolsSepares,
  construireMemeContrainte,
  construirePartitionComplementaire,
  construireRepetition,
  () => construireComparaison(),
  construireFamilleDEquilibree,
  construireFamilleDEquilibree,
  construireFamilleDEquilibree,
  () => construireAnagrammes(),
];

export function genererExerciceDenombrementCombine(): ExerciceDenombrementCombine {
  return tirerParmi(TIRAGE_LIBRE)();
}
