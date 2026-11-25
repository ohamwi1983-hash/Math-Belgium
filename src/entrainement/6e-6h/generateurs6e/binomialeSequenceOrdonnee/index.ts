import type { ExerciceBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import { construireAvecTypeQuestion, determinerStrategieA, genererFamilleA, probabiliteExactement } from "./familleA";
import { construireExerciceA } from "./familleA6gen48";
import { construireFamilleB, genererFamilleB, produitFractionsDecroissantes } from "./familleB";
import { tirerParmi } from "./aleatoire";

export { construireAvecTypeQuestion, genererFamilleA, probabiliteExactement, determinerStrategieA, construireFamilleB, genererFamilleB, produitFractionsDecroissantes, construireExerciceA };

/**
 * Couche A (6e) — `6gen48` « Probabilité binomiale et séquence exacte » (6e ch. 7, § 6).
 * Catalogue : ordre figé (codes imprimés). Audit (G22) : chaque variante tire maintenant n, p (et la
 * stratégie pour « au moins / au plus ») — avant, le sélecteur donnait toujours n = 8, p = 1/2 et
 * (10, 4). Tirage libre : la stratégie (terme unique, somme, complément) est tirée à parts égales ;
 * famille B une fois sur quatre.
 */

export type IdVarianteBinomialeSequenceOrdonnee = "A_exactement" | "A_auMoins" | "A_auPlus" | "A_aucun" | "A_tous" | "B_sequence";

export const CATALOGUE_VARIANTES: { id: IdVarianteBinomialeSequenceOrdonnee; label: string }[] = [
  { id: "A_exactement", label: "A — Exactement k succès (terme unique)" },
  { id: "A_auMoins", label: "A — Au moins k succès (somme ou complément)" },
  { id: "A_auPlus", label: "A — Au plus k succès (somme ou complément)" },
  { id: "A_aucun", label: "A — Aucun succès (terme unique)" },
  { id: "A_tous", label: "A — Tous des succès (terme unique)" },
  { id: "B_sequence", label: "B — Séquence exacte, sans remise" },
];

export function construireAvecVarianteId(id: IdVarianteBinomialeSequenceOrdonnee): ExerciceBinomialeSequenceOrdonnee {
  switch (id) {
    case "A_exactement":
      return construireExerciceA("termeUnique", ["exactement"]);
    case "A_auMoins":
      return construireExerciceA(tirerParmi(["somme", "complement"] as const), ["auMoins"]);
    case "A_auPlus":
      return construireExerciceA(tirerParmi(["somme", "complement"] as const), ["auPlus"]);
    case "A_aucun":
      return construireExerciceA("termeUnique", ["aucun"]);
    case "A_tous":
      return construireExerciceA("termeUnique", ["tous"]);
    case "B_sequence":
      return genererFamilleB();
  }
}

export function genererExerciceBinomialeSequenceOrdonnee(): ExerciceBinomialeSequenceOrdonnee {
  return Math.random() < 0.75 ? construireExerciceA() : genererFamilleB();
}
