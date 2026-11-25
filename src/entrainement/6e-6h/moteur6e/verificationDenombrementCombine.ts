import type { ExerciceDenombrementCombine } from "../core6e/denombrementCombine.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { estChoixDenombrementCombine, phasesPourExercice } from "./typesDenombrementCombine";
import type { PhaseDenombrementCombine } from "./typesDenombrementCombine";

/**
 * Vérification de `6gen44`. Audit 6e ch. 7 (G5) : l'écran « formule » exige une écriture avec « ! »
 * ou C (un nombre y est refusé SANS tentative), l'écran « calcul » exige un nombre (la formule
 * recopiée y est refusée sans tentative) — avant, les deux écrans acceptaient la même chose.
 */

export function attentesDenombrementCombine(e: ExerciceDenombrementCombine, p: PhaseDenombrementCombine): Attente[] {
  switch (e.famille) {
    case "A":
      return [{ nature: p === "aEcran1" ? "formule" : "nombre", cible: e.resultat }];
    case "B":
      return p === "bEcran1" ? [{ choix: e.sousType }] : [{ nature: "entier", cible: e.resultat }];
    case "C":
      if (e.sousType === "comparaison") return p === "cEcran1" ? [{ choix: e.discernables ? "B" : "Gamma" }] : [{ nature: "entier", cible: e.resultat }];
      return [{ nature: p === "cEcran1" ? "formule" : "nombre", cible: e.resultat }];
    case "D":
      if (p === "dEcran1") return [{ choix: e.typeContrainte }];
      if (p === "dEcran2") return [{ nature: "entier", cible: e.terme1 }, { nature: "entier", cible: e.terme2 }];
      return [{ nature: "entier", cible: e.resultatFinal }];
    case "E":
      if (p === "eEcran1") return [{ nature: "formule", cible: e.nombreMots }];
      if (p === "eEcran2") return [{ nature: "nombre", cible: e.nombreMots }];
      return [{ nature: "entier", cible: e.nombreMots - 1 }];
  }
}

export const DEFINITION_6GEN44: DefinitionSession<ExerciceDenombrementCombine, PhaseDenombrementCombine> = {
  phases: phasesPourExercice,
  estChoix: estChoixDenombrementCombine,
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesDenombrementCombine(e, p), valeurs),
};
