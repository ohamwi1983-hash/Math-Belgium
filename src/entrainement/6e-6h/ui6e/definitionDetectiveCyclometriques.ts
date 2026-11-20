import type { ExerciceDetectiveCyclo } from "../core6e/detectiveCyclometriques.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseDetectiveCyclo } from "./formatDetectiveCyclometriques";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveCyclometriques";
import { copie } from "../moteur6e/modeleDetectiveCyclometriques";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationDetectiveCyclometriques";
import { correctionDetailleeDetectiveCyclo } from "../generateurs6e/detectiveCyclometriques/corrigeDetaille";

/** `6gen152` : ligne fausse (choix), erreur (choix), correction (champs, ou intervalle). */
export const DEFINITION_DETECTIVE_CYCLO: DefinitionEcrans<ExerciceDetectiveCyclo, PhaseDetectiveCyclo> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    if (copie(e).valeurs[0].genre === "intervalle") return { type: "intervalles", variable: "x", placeholders: ["ex. : −2/5", "ex. : 1−π"] };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  copie: (e, p) => ({ lignes: copie(e).lignes, signalee: p === "ligne" ? null : copie(e).ligneFausse }),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  approchee,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDetectiveCyclo,
};
