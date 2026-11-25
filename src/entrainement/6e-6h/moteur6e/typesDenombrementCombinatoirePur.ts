import type { ExerciceDenombrementCombinatoirePur } from "../core6e/denombrementCombinatoirePur.types";

/**
 * Écrans de `6gen46` (6e ch. 7, § 4). A : combinaison de la main, cartes restantes, total ; B :
 * groupes supposés nommés, puis non nommés ; C : un écran ; D : décompositions (listes), nombres
 * d'ordres, totaux, puis la comparaison (choix fermé SEUL sur son écran, une tentative — avant, il
 * partageait l'écran et les trois tentatives des totaux).
 */
export type PhaseDenombrementCombinatoirePur = "aEcran1" | "aEcran2" | "aEcran3" | "bEcran1" | "bEcran2" | "cEcran1" | "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4";

export function phasesPourExercice(e: ExerciceDenombrementCombinatoirePur): PhaseDenombrementCombinatoirePur[] {
  switch (e.famille) {
    case "A":
      return ["aEcran1", "aEcran2", "aEcran3"];
    case "B":
      return ["bEcran1", "bEcran2"];
    case "C":
      return ["cEcran1"];
    case "D":
      return ["dEcran1", "dEcran2", "dEcran3", "dEcran4"];
  }
}
