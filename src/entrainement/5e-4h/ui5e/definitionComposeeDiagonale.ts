import type { ExerciceComposeeDiagonale } from "../core5e/composeeDiagonale";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseComposeeDiagonale } from "./formatComposeeDiagonale";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationExistence, libelle, messageIllisible, optionsExistence, phases, recap, reponse } from "./formatComposeeDiagonale";
import { figureEcran } from "./figureComposeeDiagonale";
import { diagnostiquer, piege } from "../moteur5e/verificationComposeeDiagonale";
import { correctionDetailleeComposeeDiagonale } from "../generateurs5e/composeeDiagonale/corrigeDetaille";

/** `5gen63` : première lecture, existence (choix fermé, verdict 50/50), seconde lecture ; puces de
 * structure fixe (trois) quand la composée n'existe pas. */
export const DEFINITION_COMPOSEE_DIAGONALE: DefinitionEcrans<ExerciceComposeeDiagonale, PhaseComposeeDiagonale> = {
  phases,
  estChoix: (_e, p) => p === "existence",
  mode: (e, p) => (p === "existence" ? { type: "choix", options: optionsExistence(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureEcran(e),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  messageIllisible: () => messageIllisible(),
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationExistence(e),
  correction: correctionDetailleeComposeeDiagonale,
};
