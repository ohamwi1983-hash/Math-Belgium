import type { ExerciceDenombrementCombine } from "../core6e/denombrementCombine.types";

/**
 * Écrans de `6gen44` (6e ch. 7, § 2). A : formule (forme vérifiée : « ! » ou C exigé), puis calcul ;
 * B : structure (choix fermé seul), calcul ; C répétition : formule, calcul ; C comparaison : formule
 * (choix fermé seul), calcul ; D : contrainte (choix fermé seul), deux termes, résultat ; E : formule,
 * nombre de mots, nombre d'anagrammes.
 */
export type PhaseDenombrementCombine = "aEcran1" | "aEcran2" | "bEcran1" | "bEcran2" | "cEcran1" | "cEcran2" | "dEcran1" | "dEcran2" | "dEcran3" | "eEcran1" | "eEcran2" | "eEcran3";

export function phasesPourExercice(e: ExerciceDenombrementCombine): PhaseDenombrementCombine[] {
  switch (e.famille) {
    case "A":
      return ["aEcran1", "aEcran2"];
    case "B":
      return ["bEcran1", "bEcran2"];
    case "C":
      return ["cEcran1", "cEcran2"];
    case "D":
      return ["dEcran1", "dEcran2", "dEcran3"];
    case "E":
      return ["eEcran1", "eEcran2", "eEcran3"];
  }
}

export function estChoixDenombrementCombine(e: ExerciceDenombrementCombine, p: PhaseDenombrementCombine): boolean {
  return p === "bEcran1" || p === "dEcran1" || (p === "cEcran1" && e.famille === "C" && e.sousType === "comparaison");
}
