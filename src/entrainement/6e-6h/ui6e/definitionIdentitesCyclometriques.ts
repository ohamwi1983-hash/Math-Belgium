import type { ExerciceIdentites } from "../core6e/identitesCyclometriques.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseIdentites } from "./formatIdentitesCyclometriques";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, options, PHASES_IDENTITES, recap, reponse } from "./formatIdentitesCyclometriques";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationIdentitesCyclometriques";
import { correctionDetailleeIdentites } from "../generateurs6e/identitesCyclometriques/corrigeDetaille";

/** `6gen153` : verdict (choix fermé, une tentative) puis valeur exacte / forme en x (champ, trois tentatives). */
export const DEFINITION_IDENTITES: DefinitionEcrans<ExerciceIdentites, PhaseIdentites> = {
  phases: () => PHASES_IDENTITES,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e) }),
  libelle,
  consigneGenerale,
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
  correction: correctionDetailleeIdentites,
};
