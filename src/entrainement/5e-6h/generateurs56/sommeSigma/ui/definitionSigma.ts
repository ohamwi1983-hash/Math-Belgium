import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceSigma } from "../index";
import type { PhaseSigma } from "./formatSigma";
import { aide1, aide2, bonneNature, champs, consigne, consigneGenerale, libelle, messageIllisible, OPTIONS_NATURE, phasesSigma, recap, reponse } from "./formatSigma";
import { diagnostiquer, piege } from "../moteur/verificationSigma";
import { correctionDetailleeSigma } from "../corrigeDetaille";

/** Deux ou trois écrans (socle partagé `AppEcransTrigo`) ; la nature (variante `uneSuite`) est un
 * choix fermé jugé ✗ / ✓ en une tentative. */
export const DEFINITION_SIGMA: DefinitionEcrans<ExerciceSigma, PhaseSigma> = {
  phases: phasesSigma,
  estChoix: (_e, p) => p === "nature",
  mode: (e, p) => (p === "nature" ? { type: "choix", options: OPTIONS_NATURE } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  bonneOption: (e, p) => (p === "nature" ? bonneNature(e) : ""),
  explicationChoix: (e) =>
    e.terme.kind === "arith" ? "La différence de deux termes consécutifs est constante : la suite est arithmétique." : "Le quotient de deux termes consécutifs est constant : la suite est géométrique.",
  correction: correctionDetailleeSigma,
};
