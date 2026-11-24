import type { ExerciceGraphiqueDerivee } from "../core5e/graphiqueDerivee";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseGraphiqueDerivee } from "./formatGraphiqueDerivee";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEnonce, libelle, messageIllisible, PHASES, recap, reponse } from "./formatGraphiqueDerivee";
import { aReprendre, diagnostiquer, piege } from "../moteur5e/verificationGraphiqueDerivee";
import { correctionDetailleeGraphiqueDerivee } from "../generateurs5e/graphiqueDerivee/corrigeDetaille";

/** `5gen74` : signe de f′ (deux ensembles), extremums de f (deux listes), concavité (deux
 * ensembles), points d'inflexion (liste) — quatre écrans à champs, trois tentatives chacun. */
export const DEFINITION_GRAPHIQUE_DERIVEE: DefinitionEcrans<ExerciceGraphiqueDerivee, PhaseGraphiqueDerivee> = {
  phases: () => PHASES,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureEnonce(e),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  aReprendre,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeGraphiqueDerivee,
};
