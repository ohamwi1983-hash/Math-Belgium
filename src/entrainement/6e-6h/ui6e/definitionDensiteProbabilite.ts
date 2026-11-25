import type { Exercice113, Phase113 } from "../core6e/densiteProbabilite";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_113, aide2_113, champs113, consigne113, consigneGenerale113, figure113, libelle113, messageIllisible113, phases113, recap113, reponse113 } from "./formatDensiteProbabilite";
import { approchee113, diagnostiquer113, piege113 } from "../moteur6e/verificationDensiteProbabilite";
import { correctionDetaillee113 } from "../generateurs6e/densiteProbabilite/corrigeDetaille";

/** `6gen113` sur le socle d'écrans partagé : trois écrans à champs (trois tentatives, illisible et
 * valeur approchée sans tentative) ; la densité tracée reste sous l'énoncé à chaque écran. */
export const DEFINITION_113: DefinitionEcrans<Exercice113, Phase113> = {
  phases: phases113,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs113(e, p) }),
  libelle: libelle113,
  consigneGenerale: consigneGenerale113,
  figure: (e) => figure113(e),
  consigne: consigne113,
  approchee: approchee113,
  aide1: aide1_113,
  aide2: aide2_113,
  diagnostiquer: diagnostiquer113,
  piege: piege113,
  messageIllisible: messageIllisible113,
  reponseAttendue: reponse113,
  recap: recap113,
  correction: correctionDetaillee113,
};
