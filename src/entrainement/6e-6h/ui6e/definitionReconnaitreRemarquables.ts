import type { Exercice125, Phase125 } from "../core6e/reconnaitreRemarquables";
import { PHASES_125 } from "../core6e/reconnaitreRemarquables";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_125, aide2_125, bonneOption125, consigne125, consigneGenerale125, figureEcran125, libelle125, options125, piege125, recap125, reponse125 } from "./formatReconnaitreRemarquables";
import { correctionDetaillee125 } from "../generateurs6e/reconnaitreRemarquables/corrigeDetaille";

/** `6gen125` sur le socle d'écrans partagé : deux choix fermés jugés ✗ / ✓ (une tentative, deux
 * niveaux d'aide, message propre à l'objet) ; la figure codée reste sous l'énoncé. */
export const DEFINITION_125: DefinitionEcrans<Exercice125, Phase125> = {
  phases: () => PHASES_125,
  estChoix: () => true,
  mode: (e, p) => ({ type: "choix", options: options125(e, p) }),
  libelle: libelle125,
  consigneGenerale: consigneGenerale125,
  figure: (e) => figureEcran125(e),
  consigne: consigne125,
  aide1: aide1_125,
  aide2: aide2_125,
  diagnostiquer: (e, p, v) => [v[0] === bonneOption125(e, p) ? "correct" : "not_equivalent"],
  piege: (e, p, v) => piege125(e, p, v[0] ?? ""),
  messageIllisible: () => "",
  reponseAttendue: reponse125,
  recap: recap125,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: bonneOption125,
  correction: correctionDetaillee125,
};
