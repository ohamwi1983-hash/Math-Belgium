import type { Exercice123, Phase123 } from "../core6e/demontrerAnalytique";
import { PHASES_123 } from "../core6e/demontrerAnalytique";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_123, aide2_123, bonneOption123, champs123, consigne123, consigneGenerale123, estChoix123, figure123, libelle123, messageIllisible123, options123, recap123, reponse123 } from "./formatDemontrerAnalytique";
import { diagnostiquer123, piege123 } from "../moteur6e/verificationDemontrerAnalytique";
import { correctionDetaillee123 } from "../generateurs6e/demontrerAnalytique/corrigeDetaille";

/** `6gen123` sur le socle d'écrans partagé : deux choix fermés jugés ✗ / ✓ (repère, égalité ; une
 * tentative, message propre au choix) et deux écrans à champs en lettres (trois tentatives, illisible
 * sans tentative) ; la figure de la configuration reste sous l'énoncé. */
export const DEFINITION_123: DefinitionEcrans<Exercice123, Phase123> = {
  phases: () => PHASES_123,
  estChoix: estChoix123,
  mode: (e, p) => (estChoix123(e, p) ? { type: "choix", options: options123(e, p) } : { type: "champs", champs: champs123(e, p) }),
  libelle: libelle123,
  consigneGenerale: consigneGenerale123,
  figure: (e) => figure123(e),
  consigne: consigne123,
  aide1: aide1_123,
  aide2: aide2_123,
  diagnostiquer: diagnostiquer123,
  piege: piege123,
  messageIllisible: messageIllisible123,
  reponseAttendue: reponse123,
  recap: recap123,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: bonneOption123,
  correction: correctionDetaillee123,
};
