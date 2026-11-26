import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceSansAbs, PhaseSansAbs } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, libelle, messageIllisible, mode, phases, recap, reponse } from "./format";
import { aReprendre, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeSansAbs } from "../corrigeDetaille";

/** `56gen19` : zéros (deux champs), puis l'expression réduite sur chacun des trois intervalles. */
export const DEFINITION_SANS_ABS: DefinitionEcrans<ExerciceSansAbs, PhaseSansAbs> = {
  phases,
  estChoix: () => false,
  mode,
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  aReprendre,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeSansAbs,
};
