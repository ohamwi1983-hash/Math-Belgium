import type { Exercice100, Phase100 } from "../core6e/quelleFormule";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_100, aide2_100, bonneOption100, champs100, consigne100, consigneGenerale100, libelle100, messageIllisible100, options100, phases100, recap100, reponse100 } from "./formatQuelleFormule";
import { diagnostiquer100, piege100 } from "../moteur6e/verificationQuelleFormule";
import { correctionDetaillee100 } from "../generateurs6e/quelleFormule/corrigeDetaille";

/** `6gen100` sur le socle d'écrans partagé : trois questions du cours et le type (choix fermés, une
 * tentative, jugés ✗ / ✓, message propre et deux niveaux d'aide), puis le calcul (champ, trois
 * tentatives). La question 3 n'est posée que si l'ordre compte : cinq puces fixes. */
export const DEFINITION_100: DefinitionEcrans<Exercice100, Phase100> = {
  phases: phases100,
  estChoix: (_e, p) => p !== "calcul",
  mode: (_e, p) => (p === "calcul" ? { type: "champs", champs: champs100() } : { type: "choix", options: options100(p) }),
  libelle: libelle100,
  consigneGenerale: consigneGenerale100,
  consigne: consigne100,
  aide1: aide1_100,
  aide2: aide2_100,
  diagnostiquer: diagnostiquer100,
  piege: piege100,
  messageIllisible: messageIllisible100,
  reponseAttendue: reponse100,
  recap: recap100,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: bonneOption100,
  correction: correctionDetaillee100,
};
