import type { ExerciceLimitesRef } from "../core6e/limitesReference.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseLimitesRef } from "./formatLimitesReference";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, options, PHASES, recap, reponse } from "./formatLimitesReference";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationLimitesReference";
import { correctionDetailleeLimitesRef } from "../generateurs6e/limitesReference/corrigeDetaille";

/** 6gen145 : forme (choix), limite de référence (choix), valeur (champ). */
export const DEFINITION_LIMITES_REF: DefinitionEcrans<ExerciceLimitesRef, PhaseLimitesRef> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "valeur",
  mode: (e, p) => (p === "valeur" ? { type: "champs", champs: champs(e) } : { type: "choix", options: options(p) }),
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
  correction: correctionDetailleeLimitesRef,
};
