import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceIrrationalite, PhaseIrrationalite } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, estChoix, explication, libelle, messageIllisible, mode, phases, recap, reponse } from "./format";
import { aReprendre, bonneOption, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeIrrationalite } from "../corrigeDetaille";

/** `56gen15` : hypothèse (choix), égalité entre naturels (champ), décomposition (champ), exposants
 * (choix), conclusion (choix) — mêmes écrans pour les deux verdicts. */
export const DEFINITION_IRRATIONALITE: DefinitionEcrans<ExerciceIrrationalite, PhaseIrrationalite> = {
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
  correction: correctionDetailleeIrrationalite,
};
