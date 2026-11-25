import type { ExerciceDenombrementFondamental } from "../../core6e/denombrementFondamental.types";
import { construireBorneSuperieure, construireContientDeuxChiffres, construireContientUnChiffre, construireParite, construirePositionFixeeDernier, construirePositionFixeePremiers, construireTotal } from "./familleA";
import { construireDirect, construireInverse } from "./familleB";
import { construireArrangement, construireCartesContraintes, construireFamilleC, construireMotsLettresDistinctes, construireMotsPositionFixee, construireMotsRepetition } from "./familleC";
import { construireConsecutivesOrdreFixe, construireConsecutivesOrdreLibre, construireGrouper } from "./familleD";
import { construireCollier, construireTable } from "./familleE";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — `6gen43` « Dénombrement fondamental et arrangements » (6e ch. 7, § 1).
 *
 * Catalogue : l'ORDRE est figé (codes `?code=` imprimés : l'indice de variante y est encodé) ; la
 * variante ajoutée par l'audit (« C — arrangement simple ») est EN FIN de liste.
 * Tirage libre (audit, lot C) : chaque variante à parts égales — avant, la famille était tirée
 * d'abord, et chacune des 7 variantes A ne sortait qu'à 3 % ; la famille C compte pour ses quatre
 * groupements, tirés à parts égales (verdict équilibré).
 */

export type IdVarianteDenombrementFondamental =
  | "A_total"
  | "A_positionFixeeDernier"
  | "A_positionFixeePremiers"
  | "A_contientUnChiffre"
  | "A_contientDeuxChiffres"
  | "A_borneSuperieure"
  | "A_parite"
  | "B_direct"
  | "B_inverse"
  | "C_cartesContraintes"
  | "C_motsLettresDistinctes"
  | "C_motsRepetition"
  | "C_motsPositionFixee"
  | "D_grouper"
  | "D_consecutivesOrdreFixe"
  | "D_consecutivesOrdreLibre"
  | "E_table"
  | "E_collier"
  | "C_arrangement";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementFondamental; label: string }[] = [
  { id: "A_total", label: "A — Nombres à n chiffres distincts : total" },
  { id: "A_positionFixeeDernier", label: "A — Dernier chiffre imposé" },
  { id: "A_positionFixeePremiers", label: "A — Premier(s) chiffre(s) imposé(s)" },
  { id: "A_contientUnChiffre", label: "A — Contient un chiffre donné (complément)" },
  { id: "A_contientDeuxChiffres", label: "A — Contient deux chiffres donnés (inclusion-exclusion)" },
  { id: "A_borneSuperieure", label: "A — Premier chiffre borné" },
  { id: "A_parite", label: "A — Pair ou multiple de 5 (deux cas selon le 0)" },
  { id: "B_direct", label: "B — Diagonales d'un polygone : direct" },
  { id: "B_inverse", label: "B — Diagonales d'un polygone : trouver n" },
  { id: "C_cartesContraintes", label: "C — Mains de cartes (combinaison)" },
  { id: "C_motsLettresDistinctes", label: "C — Mots avec toutes les lettres (permutation)" },
  { id: "C_motsRepetition", label: "C — Codes avec répétition (arrangement avec répétition)" },
  { id: "C_motsPositionFixee", label: "C — Mots, lettres imposées (permutation)" },
  { id: "D_grouper", label: "D — Grouper par catégorie" },
  { id: "D_consecutivesOrdreFixe", label: "D — Lettres côte à côte, ordre imposé" },
  { id: "D_consecutivesOrdreLibre", label: "D — Lettres côte à côte, ordre libre" },
  { id: "E_table", label: "E — Permutation circulaire : table ronde" },
  { id: "E_collier", label: "E — Permutation circulaire : collier, bracelet" },
  { id: "C_arrangement", label: "C — Podium, bureau, tiercé (arrangement simple)" },
];

const CONSTRUCTEURS: Record<IdVarianteDenombrementFondamental, () => ExerciceDenombrementFondamental> = {
  A_total: construireTotal,
  A_positionFixeeDernier: construirePositionFixeeDernier,
  A_positionFixeePremiers: construirePositionFixeePremiers,
  A_contientUnChiffre: construireContientUnChiffre,
  A_contientDeuxChiffres: construireContientDeuxChiffres,
  A_borneSuperieure: construireBorneSuperieure,
  A_parite: construireParite,
  B_direct: () => construireDirect(),
  B_inverse: () => construireInverse(),
  C_cartesContraintes: construireCartesContraintes,
  C_motsLettresDistinctes: construireMotsLettresDistinctes,
  C_motsRepetition: construireMotsRepetition,
  C_motsPositionFixee: construireMotsPositionFixee,
  D_grouper: construireGrouper,
  D_consecutivesOrdreFixe: construireConsecutivesOrdreFixe,
  D_consecutivesOrdreLibre: construireConsecutivesOrdreLibre,
  E_table: () => construireTable(),
  E_collier: () => construireCollier(),
  C_arrangement: construireArrangement,
};

export function construireAvecVarianteId(id: IdVarianteDenombrementFondamental): ExerciceDenombrementFondamental {
  return CONSTRUCTEURS[id]();
}

/** Parts égales : 7 variantes A, 2 B, 4 groupements C (`construireFamilleC`), 3 D, 2 E. */
const TIRAGE_LIBRE: (() => ExerciceDenombrementFondamental)[] = [
  construireTotal,
  construirePositionFixeeDernier,
  construirePositionFixeePremiers,
  construireContientUnChiffre,
  construireContientDeuxChiffres,
  construireBorneSuperieure,
  construireParite,
  () => construireDirect(),
  () => construireInverse(),
  construireFamilleC,
  construireFamilleC,
  construireFamilleC,
  construireFamilleC,
  construireGrouper,
  construireConsecutivesOrdreFixe,
  construireConsecutivesOrdreLibre,
  () => construireTable(),
  () => construireCollier(),
];

export function genererExerciceDenombrementFondamental(): ExerciceDenombrementFondamental {
  return tirerParmi(TIRAGE_LIBRE)();
}
