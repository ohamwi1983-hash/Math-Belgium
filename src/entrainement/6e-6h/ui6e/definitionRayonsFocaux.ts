import type { Exercice136, Phase136 } from "../core6e/rayonsFocaux";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_136, aide2_136, bonneOption136, champs136, consigne136, consigneGenerale136, estChoix136, figure136, libelle136, messageIllisible136, options136, phases136, recap136, reponse136 } from "./formatRayonsFocaux";
import { approchee136, diagnostiquer136, piege136 } from "../moteur6e/verificationRayonsFocaux";
import { correctionDetaillee136 } from "../generateurs6e/rayonsFocaux/corrigeDetaille";

/** `6gen136` sur le socle d'écrans partagé : champs (trois tentatives, illisible et valeur approchée
 * sans tentative) et choix fermé de l'existence (une tentative, jugé ✗ / ✓). */
export const DEFINITION_136: DefinitionEcrans<Exercice136, Phase136> = {
  phases: phases136,
  estChoix: estChoix136,
  mode: (e, p) => (estChoix136(e, p) ? { type: "choix", options: options136() } : { type: "champs", champs: champs136(e, p) }),
  libelle: libelle136,
  consigneGenerale: consigneGenerale136,
  figure: (e) => figure136(e),
  consigne: consigne136,
  approchee: approchee136,
  aide1: aide1_136,
  aide2: aide2_136,
  diagnostiquer: diagnostiquer136,
  piege: piege136,
  messageIllisible: messageIllisible136,
  reponseAttendue: reponse136,
  recap: recap136,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneOption136(e),
  correction: correctionDetaillee136,
};
