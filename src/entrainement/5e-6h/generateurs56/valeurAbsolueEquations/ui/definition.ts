import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceAbsolue, PhaseAbsolue } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, estChoix, explication, libelle, messageIllisible, mode, phases, recap, reponse } from "./format";
import { approchee, aReprendre, bonneOption, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeAbsolue } from "../corrigeDetaille";

/** `56gen18` : traduction (choix fermé) puis ensemble des solutions (champ libre) ; deuxAbsolues : deux
 * solutions puis l'ensemble. */
export const DEFINITION_ABSOLUE: DefinitionEcrans<ExerciceAbsolue, PhaseAbsolue> = {
  phases,
  estChoix,
  mode,
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  aReprendre,
  approchee,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneOption(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explication(e),
  correction: correctionDetailleeAbsolue,
};
