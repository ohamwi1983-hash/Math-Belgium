import type { Exercice132, Phase132 } from "../core6e/lireConique";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_132, aide2_132, bonneOption132, champs132, consigne132, consigneGenerale132, estChoix132, figure132, libelle132, messageIllisible132, options132, phases132, recap132, reponse132 } from "./formatLireConique";
import { approchee132, diagnostiquer132, piege132 } from "../moteur6e/verificationLireConique";
import { correctionDetaillee132 } from "../generateurs6e/lireConique/corrigeDetaille";

/** `6gen132` sur le socle d'écrans partagé : choix fermés (nature, axe, propriété : une tentative, jugés
 * ✗ / ✓) et champs (trois tentatives, illisible et valeur approchée sans tentative). */
export const DEFINITION_132: DefinitionEcrans<Exercice132, Phase132> = {
  phases: phases132,
  estChoix: estChoix132,
  mode: (e, p) => (estChoix132(e, p) ? { type: "choix", options: options132(e, p) } : { type: "champs", champs: champs132(e, p) }),
  libelle: libelle132,
  consigneGenerale: consigneGenerale132,
  figure: figure132,
  consigne: consigne132,
  approchee: approchee132,
  aide1: aide1_132,
  aide2: aide2_132,
  diagnostiquer: diagnostiquer132,
  piege: piege132,
  messageIllisible: messageIllisible132,
  reponseAttendue: reponse132,
  recap: recap132,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e, p) => bonneOption132(e, p),
  correction: correctionDetaillee132,
};
