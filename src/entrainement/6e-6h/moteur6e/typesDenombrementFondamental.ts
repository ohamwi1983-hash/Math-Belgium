import type { ExerciceDenombrementFondamental } from "../core6e/denombrementFondamental.types";

/**
 * Écrans de `6gen43` (6e ch. 7, § 1). Famille A : un écran par liste de valeurs attendues
 * (`valeursEcrans`, 1 à 3) ; B : 1 (direct) ou 2 (inverse) ; C : groupement (choix fermé, seul sur
 * son écran), puis calcul ; D : unités, rangement des unités, résultat ; E : situation (choix fermé),
 * puis calcul.
 */
export type PhaseDenombrementFondamental = "a1" | "a2" | "a3" | "b1" | "b2" | "c1" | "c2" | "d1" | "d2" | "d3" | "e1" | "e2";

export function phasesPourExercice(e: ExerciceDenombrementFondamental): PhaseDenombrementFondamental[] {
  switch (e.famille) {
    case "A":
      return (["a1", "a2", "a3"] as const).slice(0, e.valeursEcrans.length);
    case "B":
      return e.sousType === "direct" ? ["b1"] : ["b1", "b2"];
    case "C":
      return ["c1", "c2"];
    case "D":
      return ["d1", "d2", "d3"];
    case "E":
      return ["e1", "e2"];
  }
}

export function estChoixDenombrementFondamental(_e: ExerciceDenombrementFondamental, p: PhaseDenombrementFondamental): boolean {
  return p === "c1" || p === "e1";
}
