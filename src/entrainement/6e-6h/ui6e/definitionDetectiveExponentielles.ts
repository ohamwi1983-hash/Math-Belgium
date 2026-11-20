import type { ExerciceDetectiveExp } from "../core6e/detectiveExponentielles.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseDetectiveExp } from "./formatDetectiveExponentielles";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveExponentielles";
import { copie } from "../moteur6e/modeleDetectiveExponentielles";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationDetectiveExponentielles";
import { correctionDetailleeDetectiveExp } from "../generateurs6e/detectiveExponentielles/corrigeDetaille";

/** 6gen144 : ligne fausse (choix), erreur (choix), correction (champs, ou intervalle pour l'inéquation). */
export const DEFINITION_DETECTIVE_EXP: DefinitionEcrans<ExerciceDetectiveExp, PhaseDetectiveExp> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    if (copie(e).valeurs[0].genre === "intervalle") return { type: "intervalles", variable: "x", placeholders: ["ex. : −∞", "ex. : 7/4"] };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  tableau: (e) => copie(e).tableau ?? null,
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
  correction: correctionDetailleeDetectiveExp,
};
