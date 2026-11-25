import type { Exercice134, Phase134 } from "../core6e/reduireConique";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_134, aide2_134, bonneOption134, champs134, consigne134, consigneGenerale134, estChoix134, libelle134, messageIllisible134, options134, phases134, recap134, reponse134 } from "./formatReduireConique";
import { approchee134, diagnostiquer134, piege134 } from "../moteur6e/verificationReduireConique";
import { correctionDetaillee134 } from "../generateurs6e/reduireConique/corrigeDetaille";

/** `6gen134` sur le socle d'écrans partagé : champs (trois tentatives, illisible et valeur approchée sans
 * tentative) et choix fermé de la nature et de l'axe (une tentative, jugé ✗ / ✓). */
export const DEFINITION_134: DefinitionEcrans<Exercice134, Phase134> = {
  phases: phases134,
  estChoix: estChoix134,
  mode: (e, p) => (estChoix134(e, p) ? { type: "choix", options: options134() } : { type: "champs", champs: champs134(e, p) }),
  libelle: libelle134,
  consigneGenerale: consigneGenerale134,
  consigne: consigne134,
  approchee: approchee134,
  aide1: aide1_134,
  aide2: aide2_134,
  diagnostiquer: diagnostiquer134,
  piege: piege134,
  messageIllisible: messageIllisible134,
  reponseAttendue: reponse134,
  recap: recap134,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneOption134(e),
  correction: correctionDetaillee134,
};
