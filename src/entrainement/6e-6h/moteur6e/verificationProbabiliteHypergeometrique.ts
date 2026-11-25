import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesProbabiliteHypergeometrique";
import type { PhaseProbabiliteHypergeometrique } from "./typesProbabiliteHypergeometrique";

/**
 * Vérification de `6gen47` — EXACTE (audit, G16) : valeur exacte, ou arrondi correct au millième au
 * moins (deux chiffres significatifs au moins) ; la tolérance absolue de 0,01 acceptait un mauvais
 * arrondi dans 50 à 67 % des cas, et la probabilité AVEC remise pour un tirage sans remise dans 24 %.
 */

export function attentesProbabiliteHypergeometrique(e: ExerciceProbabiliteHypergeometrique, p: PhaseProbabiliteHypergeometrique): Attente[] {
  switch (e.famille) {
    case "A": {
      const cible = rationnel(e.numerateurFacteur1 * e.numerateurFacteur2, e.denominateur);
      return [{ nature: p === "aEcran1" ? "formule" : "probabiliteCalculee", cible }];
    }
    case "B":
      if (p === "bEcran1") return [{ nature: "probabilite", cible: rationnel(e.numerateurSequence, e.denominateurSequence) }];
      if (p === "bEcran2") return [{ nature: "entier", cible: e.nombreArrangements }];
      return [{ nature: "probabilite", cible: rationnel(e.numerateurComposition, e.denominateurComposition) }];
    case "C":
      if (p === "cEcran1") return [{ nature: "probabilite", cible: rationnel(e.principal.numerateur, e.principal.denominateur) }];
      if (p === "cEcran2") return [{ nature: "probabilite", cible: rationnel(e.bonus.numerateur, e.bonus.denominateur) }];
      return [{ nature: "probabilite", cible: rationnel(e.numerateurCombine, e.denominateurCombine) }];
  }
}

export const DEFINITION_6GEN47: DefinitionSession<ExerciceProbabiliteHypergeometrique, PhaseProbabiliteHypergeometrique> = {
  phases: phasesPourExercice,
  estChoix: () => false,
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesProbabiliteHypergeometrique(e, p), valeurs),
};
