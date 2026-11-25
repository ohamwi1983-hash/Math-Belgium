import type { Exercice114, Phase114 } from "../core6e/discreteOuContinue";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { PHASES_114, aide1_114, aide2_114, bonneOption114, consigne114, consigneGenerale114, libelle114, options114, piegeTexte114, recap114, reponse114 } from "./formatDiscreteOuContinue";
import { correctionDetaillee114 } from "../generateurs6e/discreteOuContinue/corrigeDetaille";

/** `6gen114` sur le socle d'écrans partagé : trois choix fermés jugés ✗ / ✓ (une tentative, deux
 * niveaux d'aide, message propre à la situation). */
export const DEFINITION_114: DefinitionEcrans<Exercice114, Phase114> = {
  phases: () => PHASES_114,
  estChoix: () => true,
  mode: (e, p) => ({ type: "choix", options: options114(e, p) }),
  libelle: libelle114,
  consigneGenerale: consigneGenerale114,
  consigne: consigne114,
  aide1: aide1_114,
  aide2: aide2_114,
  diagnostiquer: (e, p, v) => [v[0] === bonneOption114(e, p) ? "correct" : "not_equivalent"],
  piege: (e, p, v) => piegeTexte114(e, p, v[0] ?? ""),
  messageIllisible: () => "",
  reponseAttendue: reponse114,
  recap: recap114,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: bonneOption114,
  correction: correctionDetaillee114,
};
