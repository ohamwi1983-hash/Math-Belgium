import type { ExerciceDroiteMayer } from "../core5e/droiteMayer";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDroiteMayer } from "./formatDroiteMayer";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, PHASES, recap, reponse, tableau } from "./formatDroiteMayer";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationDroiteMayer";
import { correctionDetailleeDroiteMayer } from "../generateurs5e/droiteMayer/corrigeDetaille";

/** `5gen36` : six écrans à champs (trois tentatives) ; valeur trop arrondie refusée sans tentative. */
export const DEFINITION_DROITE_MAYER: DefinitionEcrans<ExerciceDroiteMayer, PhaseDroiteMayer> = {
  phases: () => PHASES,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: figureEcran,
  tableau,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  approchee,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeDroiteMayer,
};
