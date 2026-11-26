import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceRang } from "../index";
import type { PhaseRang } from "./formatRang";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, phasesRang, recap, reponse } from "./formatRang";
import { approchee, diagnostiquer, piege } from "../moteur/verificationRang";
import { correctionDetailleeRang } from "../corrigeDetaille";

/** Quatre écrans à champs (socle partagé `AppEcransTrigo`). */
export const DEFINITION_RANG: DefinitionEcrans<ExerciceRang, PhaseRang> = {
  phases: phasesRang,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  approchee,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeRang,
};
