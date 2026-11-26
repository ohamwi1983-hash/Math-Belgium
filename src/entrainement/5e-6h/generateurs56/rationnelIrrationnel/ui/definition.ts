import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceRationnel, PhaseRationnel } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, explication, libelle, messageIllisible, options, phases, recap, reponse } from "./format";
import { bonneOption, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeRationnel } from "../corrigeDetaille";

/** `56gen14` : quatre choix fermés (un par nombre), jugés ✗ / ✓ et figés ; deux niveaux d'aide. */
export const DEFINITION_RATIONNEL: DefinitionEcrans<ExerciceRationnel, PhaseRationnel> = {
  phases,
  estChoix: () => true,
  mode: () => ({ type: "choix", options: options() }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption,
  messageIllisible: () => messageIllisible(),
  reponseAttendue: reponse,
  recap,
  explicationChoix: explication,
  correction: correctionDetailleeRationnel,
};
