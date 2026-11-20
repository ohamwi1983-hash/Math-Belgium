import type { ExerciceDeriveeReciproque } from "../core6e/deriveeReciproquePoint.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseReciproque } from "./formatDeriveeReciproquePoint";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsTheoreme, phases, recap, reponse } from "./formatDeriveeReciproquePoint";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationDeriveeReciproquePoint";
import { correctionDetailleeReciproque } from "../generateurs6e/deriveeReciproquePoint/corrigeDetaille";

/** `6gen155` : x₀ (champ), f′(x₀) (champ), théorème (choix fermé, une tentative), (f⁻¹)′(y₀) (champ, si f′(x₀) ≠ 0). */
export const DEFINITION_RECIPROQUE: DefinitionEcrans<ExerciceDeriveeReciproque, PhaseReciproque> = {
  phases,
  estChoix: (_e, p) => p === "theoreme",
  mode: (e, p) => (p === "theoreme" ? { type: "choix", options: optionsTheoreme() } : { type: "champs", champs: champs(e, p) }),
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
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleeReciproque,
};
