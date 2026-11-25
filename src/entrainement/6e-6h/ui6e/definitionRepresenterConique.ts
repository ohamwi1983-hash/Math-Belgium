import type { Exercice133, Phase133 } from "../core6e/representerConique";
import { pointsAttendus133 } from "../core6e/representerConique";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_133, aide2_133, consigne133, consigneGenerale133, libelle133, phases133, reponse133 } from "./formatRepresenterConique";
import { diagnostiquer133, piege133 } from "../moteur6e/verificationRepresenterConique";
import { correctionDetaillee133 } from "../generateurs6e/representerConique/corrigeDetaille";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";

/**
 * `6gen133` décrit dans le contrat des écrans partagés (`DefinitionEcrans`) pour réutiliser le MOTEUR de
 * session (`sessionEcransTrigo` : trois tentatives par écran, aides à deux niveaux, réponse révélée) ;
 * l'écran, lui, est la surface de placement de 5gen52 (`EtapePlacerPointsTrig5e`), branchée par
 * `App6gen133`. Les valeurs transmises au moteur sont les points placés, encodés « x;y ».
 */
export const DEFINITION_133: DefinitionEcrans<Exercice133, Phase133> = {
  phases: phases133,
  estChoix: () => false,
  mode: () => ({ type: "champs", champs: [] }),
  libelle: libelle133,
  consigneGenerale: consigneGenerale133,
  consigne: consigne133,
  aide1: aide1_133,
  aide2: aide2_133,
  diagnostiquer: diagnostiquer133,
  piege: (e, p, v) => piege133(e, p, v) as Frag[] | null,
  messageIllisible: () => "",
  reponseAttendue: reponse133,
  recap: reponse133,
  correction: correctionDetaillee133,
};

export const nombrePoints133 = (e: Exercice133, p: Phase133) => pointsAttendus133(e, p).length;
