import type { ExerciceDenombrementCombinatoirePur, FamilleDenombrementCombinatoirePur } from "../../core6e/denombrementCombinatoirePur.types";
import { construireBrelan, construireCarre, construireDeuxPaires, construireFamilleA, construirePaire } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";

export { construireBrelan, construireCarre, construireDeuxPaires, construireFamilleA, construirePaire } from "./familleA";
export { construireFamilleB } from "./familleB";
export { construireFamilleC } from "./familleC";
export { construireFamilleD, decompositionsSomme } from "./familleD";

/**
 * Couche A (6e) — point d'entrée `6gen46` ("Dénombrement combinatoire pur : problèmes"), 3ᵉ
 * générateur du chapitre "Analyse combinatoire". Tirage ÉQUIPROBABLE de la famille (A à D) —
 * mirroir `denombrementFondamental/index.ts` (6gen43) / `denombrementCombine/index.ts` (6gen44),
 * mais famille A a directement 4 sous-constructeurs (jamais de second niveau de tirage
 * "sous-type dans la famille" séparé, contrairement à ses 2 prédécesseurs — les familles B/C/D de
 * CE générateur n'ont qu'un seul constructeur chacune).
 */

export type IdVarianteDenombrementCombinatoirePur = "A_carre" | "A_brelan" | "A_paire" | "A_deuxPaires" | "B_repartition" | "C_affichages" | "D_sommeTriplets";

export const CATALOGUE_VARIANTES: { id: IdVarianteDenombrementCombinatoirePur; label: string }[] = [
  { id: "A_carre", label: "A — Poker : carré" },
  { id: "A_brelan", label: "A — Poker : brelan" },
  { id: "A_paire", label: "A — Poker : une seule paire" },
  { id: "A_deuxPaires", label: "A — Poker : deux paires" },
  { id: "B_repartition", label: "B — Répartition en groupes de tailles données" },
  { id: "C_affichages", label: "C — Dénombrement avec répétition" },
  { id: "D_sommeTriplets", label: "D — Triplets ordonnés pour une somme donnée" },
];

export function construireAvecVarianteId(id: IdVarianteDenombrementCombinatoirePur): ExerciceDenombrementCombinatoirePur {
  switch (id) {
    case "A_carre":
      return construireCarre();
    case "A_brelan":
      return construireBrelan();
    case "A_paire":
      return construirePaire();
    case "A_deuxPaires":
      return construireDeuxPaires();
    case "B_repartition":
      return construireFamilleB();
    case "C_affichages":
      return construireFamilleC();
    case "D_sommeTriplets":
      return construireFamilleD();
  }
}

const FAMILLES: FamilleDenombrementCombinatoirePur[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleDenombrementCombinatoirePur, () => ExerciceDenombrementCombinatoirePur> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
};

export function genererExerciceDenombrementCombinatoirePur(): ExerciceDenombrementCombinatoirePur {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
