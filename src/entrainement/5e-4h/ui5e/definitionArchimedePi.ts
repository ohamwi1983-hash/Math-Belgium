import type { ExerciceArchimedePi } from "../core5e/archimedePi";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseArchimede } from "./formatArchimedePi";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, PHASES_ARCHIMEDE, recap, reponse } from "./formatArchimedePi";
import { figureArchimede } from "./figureArchimedePi";
import { diagnostiquer, piege } from "../moteur5e/verificationArchimedePi";
import { correctionDetailleeArchimedePi } from "../generateurs5e/archimedePi/corrigeDetaille";

/** Cinq écrans : α, côtés, encadrement (n), encadrement (2n), nombre de côtés pour un seuil. */
export const DEFINITION_ARCHIMEDE_PI: DefinitionEcrans<ExerciceArchimedePi, PhaseArchimede> = {
  phases: () => PHASES_ARCHIMEDE,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureArchimede(e),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeArchimedePi,
};
