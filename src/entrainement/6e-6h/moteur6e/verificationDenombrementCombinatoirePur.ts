import type { ExerciceDenombrementCombinatoirePur } from "../core6e/denombrementCombinatoirePur.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesDenombrementCombinatoirePur";
import type { PhaseDenombrementCombinatoirePur } from "./typesDenombrementCombinatoirePur";

/**
 * Vérification de `6gen46`. Décompositions lues par la lecture commune : {1;2;6} (notation du cours),
 * (1, 2, 6), 1 2 6 sont acceptés (audit, G14 : avant, refusés comme illisibles et décomptés).
 */

export function attentesDenombrementCombinatoirePur(e: ExerciceDenombrementCombinatoirePur, p: PhaseDenombrementCombinatoirePur): Attente[] {
  switch (e.famille) {
    case "A":
      return [{ nature: "entier", cible: p === "aEcran1" ? e.etape1 : p === "aEcran2" ? e.etape2 : e.resultatFinal }];
    case "B":
      return [{ nature: "entier", cible: p === "bEcran1" ? e.nommes : e.resultat }];
    case "C":
      return [{ nature: "entier", cible: e.resultat }];
    case "D":
      if (p === "dEcran1") return [{ lignes: e.decompositionsS1.map((d) => d.valeurs) }, { lignes: e.decompositionsS2.map((d) => d.valeurs) }];
      if (p === "dEcran2") return [...e.decompositionsS1, ...e.decompositionsS2].map((d) => ({ nature: "entier", cible: d.arrangements }));
      if (p === "dEcran3") return [{ nature: "entier", cible: e.totalS1 }, { nature: "entier", cible: e.totalS2 }];
      return [{ choix: e.comparaison }];
  }
}

export const DEFINITION_6GEN46: DefinitionSession<ExerciceDenombrementCombinatoirePur, PhaseDenombrementCombinatoirePur> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "dEcran4",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesDenombrementCombinatoirePur(e, p), valeurs),
};
