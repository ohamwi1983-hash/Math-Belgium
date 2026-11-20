import type { ExerciceDetectiveFonctions } from "../core5e/detectiveFonctions.types";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDetectiveFonctions } from "./formatDetectiveFonctions";
import { aide1, aide2, champ, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveFonctions";
import { copie } from "../moteur5e/modeleDetectiveFonctions";
import { diagnostiquer, piege } from "../moteur5e/verificationDetectiveFonctions";
import { correctionDetailleeDetectiveFonctions } from "../generateurs5e/detectiveFonctions/corrigeDetaille";

/** `5gen58` : ligne fausse (choix), erreur (choix, 4 descriptions), correction (champ). */
export const DEFINITION_DETECTIVE_FONCTIONS: DefinitionEcrans<ExerciceDetectiveFonctions, PhaseDetectiveFonctions> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    return { type: "champs", champs: [champ(e)] };
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
  correction: correctionDetailleeDetectiveFonctions,
};
