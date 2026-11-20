import type { ExerciceModeleTableau } from "../core6e/modeleTableau.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseModeleTableau } from "./formatModeleTableau";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, options, PHASES, recap, reponse, tableau } from "./formatModeleTableau";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationModeleTableau";
import { correctionDetailleeModeleTableau } from "../generateurs6e/modeleTableau/corrigeDetaille";

/** 6gen147 : rapports (champs), verdict (choix), paramètres (champs), prévision (champ). */
export const DEFINITION_MODELE_TABLEAU: DefinitionEcrans<ExerciceModeleTableau, PhaseModeleTableau> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: options() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  tableau,
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
  correction: correctionDetailleeModeleTableau,
};
