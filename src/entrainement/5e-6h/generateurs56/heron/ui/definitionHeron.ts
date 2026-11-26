import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceHeron } from "../index";
import type { PhaseHeron } from "./formatHeron";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, phasesDe, recap, reponse } from "./formatHeron";
import { aReprendre, approchee, diagnostiquer, piege } from "../moteur/verificationHeron";
import { correctionDetailleeHeron } from "../corrigeDetaille";

/** Quatre écrans à champs (socle partagé `AppEcransTrigo`) : Héron ou méthode des puissances. */
export const DEFINITION_HERON: DefinitionEcrans<ExerciceHeron, PhaseHeron> = {
  phases: phasesDe,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  approchee,
  aReprendre,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeHeron,
};
