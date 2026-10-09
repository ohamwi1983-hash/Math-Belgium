import type { ExerciceDenombrementFondamental, FamilleDenombrementFondamental } from "../../core6e/denombrementFondamental.types";
import { construireBorneSuperieure, construireContientDeuxChiffres, construireContientUnChiffre, construireFamilleA, construireParite, construirePositionFixeeDernier, construirePositionFixeePremiers, construireTotal } from "./familleA";
import { construireDirect, construireFamilleB, construireInverse } from "./familleB";
import { construireCartesContraintes, construireFamilleC, construireMotsLettresDistinctes, construireMotsPositionFixee, construireMotsRepetition } from "./familleC";
import { construireConsecutivesOrdreFixe, construireConsecutivesOrdreLibre, construireFamilleD, construireGrouper } from "./familleD";
import { construireCollier, construireFamilleE, construireTable } from "./familleE";

export {
  construireFamilleA,
  construireTotal,
  construirePositionFixeeDernier,
  construirePositionFixeePremiers,
  construireContientUnChiffre,
  construireContientDeuxChiffres,
  construireBorneSuperieure,
  construireParite,
  construireFamilleB,
  construireDirect,
  construireInverse,
  construireFamilleC,
  construireCartesContraintes,
  construireMotsLettresDistinctes,
  construireMotsRepetition,
  construireMotsPositionFixee,
  construireFamilleD,
  construireGrouper,
  construireConsecutivesOrdreFixe,
  construireConsecutivesOrdreLibre,
  construireFamilleE,
  construireTable,
  construireCollier,
};

/**
 * Couche A (6e) — point d'entrée `6gen43` ("Dénombrement fondamental et arrangements"), générateur
 * D'OUVERTURE du chapitre "Analyse combinatoire". Tirage à 2 niveaux (mirroir `generateurs6e/
 * formeTrigonometrique/index.ts`, 6gen37) : la FAMILLE (A à E) est tirée ÉQUIPROBABLE en premier,
 * puis le sous-type de la famille tirée est tiré ÉQUIPROBABLE ensuite.
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
  | "E_collier";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementFondamental; label: string }[] = [
  { id: "A_total", label: "A — Nombres à n chiffres distincts : total" },
  { id: "A_positionFixeeDernier", label: "A — Position fixée (dernier chiffre)" },
  { id: "A_positionFixeePremiers", label: "A — Position(s) fixée(s) (premiers chiffres)" },
  { id: "A_contientUnChiffre", label: "A — Contient un chiffre donné (complément)" },
  { id: "A_contientDeuxChiffres", label: "A — Contient deux chiffres donnés (inclusion-exclusion)" },
  { id: "A_borneSuperieure", label: "A — Borne supérieure sur le premier chiffre" },
  { id: "A_parite", label: "A — Parité ou multiple de m (piège 0/non-nul)" },
  { id: "B_direct", label: "B — Diagonales d'un polygone : direct" },
  { id: "B_inverse", label: "B — Diagonales d'un polygone : trouver n" },
  { id: "C_cartesContraintes", label: "C — Cartes avec contraintes (combinaison)" },
  { id: "C_motsLettresDistinctes", label: "C — Mots, lettres distinctes (permutation)" },
  { id: "C_motsRepetition", label: "C — Mots, répétition autorisée (puissance)" },
  { id: "C_motsPositionFixee", label: "C — Mots, position fixée (permutation)" },
  { id: "D_grouper", label: "D — Grouper par catégorie" },
  { id: "D_consecutivesOrdreFixe", label: "D — Lettres consécutives, ordre fixé" },
  { id: "D_consecutivesOrdreLibre", label: "D — Lettres consécutives, ordre libre" },
  { id: "E_table", label: "E — Permutation circulaire : table ronde" },
  { id: "E_collier", label: "E — Permutation circulaire : collier/bracelet" },
];

export function construireAvecVarianteId(id: IdVarianteDenombrementFondamental): ExerciceDenombrementFondamental {
  switch (id) {
    case "A_total":
      return construireTotal();
    case "A_positionFixeeDernier":
      return construirePositionFixeeDernier();
    case "A_positionFixeePremiers":
      return construirePositionFixeePremiers();
    case "A_contientUnChiffre":
      return construireContientUnChiffre();
    case "A_contientDeuxChiffres":
      return construireContientDeuxChiffres();
    case "A_borneSuperieure":
      return construireBorneSuperieure();
    case "A_parite":
      return construireParite();
    case "B_direct":
      return construireDirect();
    case "B_inverse":
      return construireInverse();
    case "C_cartesContraintes":
      return construireCartesContraintes();
    case "C_motsLettresDistinctes":
      return construireMotsLettresDistinctes();
    case "C_motsRepetition":
      return construireMotsRepetition();
    case "C_motsPositionFixee":
      return construireMotsPositionFixee();
    case "D_grouper":
      return construireGrouper();
    case "D_consecutivesOrdreFixe":
      return construireConsecutivesOrdreFixe();
    case "D_consecutivesOrdreLibre":
      return construireConsecutivesOrdreLibre();
    case "E_table":
      return construireTable();
    case "E_collier":
      return construireCollier();
  }
}

const FAMILLES: FamilleDenombrementFondamental[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleDenombrementFondamental, () => ExerciceDenombrementFondamental> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceDenombrementFondamental(): ExerciceDenombrementFondamental {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
