import type { Exercice160 } from "../core6e/independantsIncompatibles";
import { verdictCalcule } from "../core6e/independantsIncompatibles";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Phase160 } from "./format160";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, figure160, libelle, messageIllisible, options, phases160, recap, reponse } from "./format160";
import { approchee, diagnostiquer, piege } from "../moteur6e/verification160";
import { correctionDetaillee160 } from "../generateurs6e/independantsIncompatibles/corrigeDetaille";

/** `6gen160` sur le socle d'écrans partagé (`AppEcransTrigo`) : probabilités (champs, trois tentatives),
 * puis le verdict à trois issues (choix fermé, une tentative, jugé ✗ / ✓, deux niveaux d'aide). */
export const DEFINITION_160: DefinitionEcrans<Exercice160, Phase160> = {
  phases: phases160,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: options() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figure160(e),
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  aidesChoixDeuxNiveaux: true,
  explicationChoix,
  piegeChoixRevele: true,
  bonneOption: (e) => verdictCalcule(e),
  correction: correctionDetaillee160,
};
