import type { Exercice110, Phase110 } from "../core6e/varianceLoiDiscrete";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { OPTIONS_VERDICT_110, aide1_110, aide2_110, champs110, consigne110, consigneGenerale110, libelle110, messageIllisible110, phases110, recap110, reponse110, tableau110 } from "./formatVarianceLoiDiscrete";
import { aReprendre110, approchee110, diagnostiquer110, piege110 } from "../moteur6e/verificationVarianceLoiDiscrete";
import { correctionDetaillee110 } from "../generateurs6e/varianceLoiDiscrete/corrigeDetaille";

/** `6gen110` sur le socle d'écrans partagé : champs (trois tentatives, illisible et approchée sans
 * tentative) ; variante `risque` : verdict « jeu le plus risqué » en choix fermé jugé ✗ / ✓ (une
 * tentative, deux niveaux d'aide). Le tableau de la loi reste sous l'énoncé à chaque écran. */
export const DEFINITION_110: DefinitionEcrans<Exercice110, Phase110> = {
  phases: phases110,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: OPTIONS_VERDICT_110 } : { type: "champs", champs: champs110(e, p) }),
  libelle: libelle110,
  consigneGenerale: consigneGenerale110,
  tableau: tableau110,
  consigne: consigne110,
  approchee: approchee110,
  aReprendre: aReprendre110,
  aide1: aide1_110,
  aide2: aide2_110,
  diagnostiquer: diagnostiquer110,
  piege: piege110,
  messageIllisible: messageIllisible110,
  reponseAttendue: reponse110,
  recap: recap110,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => e.plusRisque ?? "A",
  correction: correctionDetaillee110,
};
