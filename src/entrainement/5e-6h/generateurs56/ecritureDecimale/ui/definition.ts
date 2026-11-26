import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDecimale, PhaseDecimale } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, estChoix, explication, libelle, messageIllisible, mode, phases, recap, reponse } from "./format";
import { aReprendre, bonneOption, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeDecimale } from "../corrigeDetaille";

/** `56gen16` : trois écrans par variante (champs à trois tentatives, choix fermés à une tentative). */
export const DEFINITION_DECIMALE: DefinitionEcrans<ExerciceDecimale, PhaseDecimale> = {
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
  piege,
  piegeChoixRevele: true,
  bonneOption,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: explication,
  correction: correctionDetailleeDecimale,
};
