import type { ExerciceDetectiveLimites } from "../core5e/detectiveLimites.types";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDetectiveLimites } from "./formatDetectiveLimites";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveLimites";
import { copie } from "../moteur5e/modeleDetectiveLimites";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationDetectiveLimites";
import { correctionDetailleeDetectiveLimites } from "../generateurs5e/detectiveLimites/corrigeDetaille";

/** `5gen67` : ligne fausse (choix), erreur (choix, 4 descriptions), correction (champ(s)). */
export const DEFINITION_DETECTIVE_LIMITES: DefinitionEcrans<ExerciceDetectiveLimites, PhaseDetectiveLimites> = {
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
  approchee,
  piegeChoixRevele: true,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDetectiveLimites,
};
