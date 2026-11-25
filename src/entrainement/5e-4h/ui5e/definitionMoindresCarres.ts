import type { ExerciceMoindresCarres } from "../core5e/moindresCarres";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseMoindresCarres } from "./formatMoindresCarres";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, phases, recap, reponse, tableau } from "./formatMoindresCarres";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationMoindresCarres";
import { correctionDetailleeMoindresCarres } from "../generateurs5e/moindresCarres/corrigeDetaille";

/** `5gen37` : écrans à champs (trois tentatives) ; valeur trop arrondie refusée sans tentative. */
export const DEFINITION_MOINDRES_CARRES: DefinitionEcrans<ExerciceMoindresCarres, PhaseMoindresCarres> = {
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
  correction: correctionDetailleeMoindresCarres,
};
