import type { Exercice124, Phase124 } from "../core6e/pointsRemarquablesEuler";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_124, aide2_124, champs124, consigne124, consigneGenerale124, figure124, libelle124, messageIllisible124, phases124, recap124, reponse124 } from "./formatPointsRemarquablesEuler";
import { approchee124, diagnostiquer124, piege124 } from "../moteur6e/verificationPointsRemarquablesEuler";
import { correctionDetaillee124 } from "../generateurs6e/pointsRemarquablesEuler/corrigeDetaille";
import { pt } from "./formatPointsRemarquablesEuler";
import { l, t } from "./outilsLieuxLotH1";

/** `6gen124` sur le socle d'écrans partagé : six écrans à un champ (trois tentatives, illisible et
 * coordonnée approchée sans tentative) ; le repère montre le triangle et les objets déjà trouvés. */
export const DEFINITION_124: DefinitionEcrans<Exercice124, Phase124> = {
  phases: phases124,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs124(e, p) }),
  libelle: libelle124,
  consigneGenerale: consigneGenerale124,
  figure: (e, p) => figure124(e, p),
  consigne: consigne124,
  approchee: approchee124,
  aide1: aide1_124,
  aide2: aide2_124,
  diagnostiquer: diagnostiquer124,
  piege: piege124,
  messageIllisible: messageIllisible124,
  reponseAttendue: reponse124,
  recap: recap124,
  correction: correctionDetaillee124,
  apercuEnonce: (e) => [t("Triangle "), l(pt("A", e.A)), t(", "), l(pt("B", e.B)), t(", "), l(pt("C", e.C))],
};
