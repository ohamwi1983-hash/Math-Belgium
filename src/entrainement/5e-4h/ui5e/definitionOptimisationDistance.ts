import type { ExerciceOptimisationDistance } from "../core5e/optimisationDistance";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseOptimisationDistance } from "./formatOptimisationDistance";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEnonce, libelle, messageIllisible, optionsSigne, PHASES, recap, reponse } from "./formatOptimisationDistance";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationOptimisationDistance";
import { correctionDetailleeOptimisationDistance } from "../generateurs5e/optimisationDistance/corrigeDetaille";

/** `5gen71` : modèle, dérivée (expressions), zéro x₀, signe sur le domaine (choix fermé), optimum. */
export const DEFINITION_OPTIMISATION_DISTANCE: DefinitionEcrans<ExerciceOptimisationDistance, PhaseOptimisationDistance> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "signe",
  mode: (e, p) => (p === "signe" ? { type: "choix", options: optionsSigne(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureEnonce(e),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  approchee,
  piege,
  piegeChoixRevele: true,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeOptimisationDistance,
};
