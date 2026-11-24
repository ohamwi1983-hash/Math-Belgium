import type { ExerciceDetectiveDerivees } from "../core5e/detectiveDerivees.types";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDetectiveDerivees } from "./formatDetectiveDerivees";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveDerivees";
import { copie } from "../moteur5e/modeleDetectiveDerivees";
import { diagnostiquer, piege } from "../moteur5e/verificationDetectiveDerivees";
import { correctionDetailleeDetectiveDerivees } from "../generateurs5e/detectiveDerivees/corrigeDetaille";

/** `5gen72` : ligne fausse (choix), erreur (choix, 4 descriptions), correction (tangente ou extremums). */
export const DEFINITION_DETECTIVE_DERIVEES: DefinitionEcrans<ExerciceDetectiveDerivees, PhaseDetectiveDerivees> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  copie: (e, p) => ({ lignes: copie(e).lignes, signalee: p === "ligne" ? null : copie(e).ligneFausse }),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDetectiveDerivees,
};
