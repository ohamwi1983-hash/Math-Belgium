import type { ExercicePointMoyen } from "../core5e/pointMoyenStat";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhasePointMoyen } from "./formatPointMoyenStat";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, phases, recap, reponse, tableau } from "./formatPointMoyenStat";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationPointMoyenStat";
import { correctionDetailleePointMoyen } from "../generateurs5e/pointMoyenStat/corrigeDetaille";

/** `5gen77` : écrans à champs (trois tentatives) ; valeur trop arrondie refusée sans tentative. */
export const DEFINITION_POINT_MOYEN_STAT: DefinitionEcrans<ExercicePointMoyen, PhasePointMoyen> = {
  phases,
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
  correction: correctionDetailleePointMoyen,
};
