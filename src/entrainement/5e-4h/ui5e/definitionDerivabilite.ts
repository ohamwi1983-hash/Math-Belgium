import type { ExerciceDerivabilite } from "../core5e/derivabilite";
import { verdict } from "../core5e/derivabilite";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDerivabilite } from "./formatDerivabilite";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, optionsVerdict, phases, recap, reponse } from "./formatDerivabilite";
import { diagnostiquer, explicationChoix, piege } from "../moteur5e/verificationDerivabilite";
import { correctionDetailleeDerivabilite } from "../generateurs5e/derivabilite/corrigeDetaille";

/** `5gen75` : continuité (f(a) et limites latérales), taux et nombre dérivé à gauche puis à
 * droite, verdict (choix fermé jugé ✗ / ✓, une tentative), tangente si dérivable. */
export const DEFINITION_DERIVABILITE: DefinitionEcrans<ExerciceDerivabilite, PhaseDerivabilite> = {
  phases,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: optionsVerdict(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  explicationChoix: (e) => explicationChoix(e),
  bonneOption: (e) => verdict(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeDerivabilite,
};
