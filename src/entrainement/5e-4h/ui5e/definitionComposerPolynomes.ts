import type { ExerciceComposerPolynomes } from "../core5e/composerPolynomes";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseComposerPolynomes } from "./formatComposerPolynomes";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationVerdict, libelle, messageIllisible, optionsVerdict, phases, recap, reponse } from "./formatComposerPolynomes";
import { aReprendre, diagnostiquer, piege } from "../moteur5e/verificationComposerPolynomes";
import { correctionDetailleeComposerPolynomes } from "../generateurs5e/composerPolynomes/corrigeDetaille";

/** `5gen61` : substitution, (f∘g)(x) développée, (g∘f)(x) développée, vérification en un point,
 * puis (deux affines) le verdict f∘g = g∘f. */
export const DEFINITION_COMPOSER_POLYNOMES: DefinitionEcrans<ExerciceComposerPolynomes, PhaseComposerPolynomes> = {
  phases,
  estChoix: (_e, p) => p === "verdict",
  mode: (e, p) => (p === "verdict" ? { type: "choix", options: optionsVerdict() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  aReprendre,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationVerdict(e),
  correction: correctionDetailleeComposerPolynomes,
};
