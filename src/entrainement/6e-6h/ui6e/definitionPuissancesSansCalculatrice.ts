import type { ExercicePuissances } from "../core6e/puissancesSansCalculatrice.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhasePuissances } from "./formatPuissancesSansCalculatrice";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, options, phases, recap, reponse } from "./formatPuissancesSansCalculatrice";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationPuissancesSansCalculatrice";
import { correctionDetailleePuissances } from "../generateurs6e/puissancesSansCalculatrice/corrigeDetaille";

/** 6gen146 : deux écrans à champ (simplifier, inverse) ou trois choix fermés (comparer). */
export const DEFINITION_PUISSANCES: DefinitionEcrans<ExercicePuissances, PhasePuissances> = {
  phases,
  estChoix: (e) => e.variante === "comparer",
  mode: (e, p) => (e.variante === "comparer" ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
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
  correction: correctionDetailleePuissances,
};
