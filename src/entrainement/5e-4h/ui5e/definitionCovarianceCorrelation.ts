import type { ExerciceCorrelation } from "../core5e/covarianceCorrelation";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseCorrelation } from "./formatCovarianceCorrelation";
import { aide1, aide2, bonneOption, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, options, phases, recap, reponse, tableau } from "./formatCovarianceCorrelation";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationCovarianceCorrelation";
import { correctionDetailleeCorrelation } from "../generateurs5e/covarianceCorrelation/corrigeDetaille";

const estChoix = (_e: ExerciceCorrelation, p: PhaseCorrelation) => p === "sens" || p === "intensite";

/** `5gen38` : champs (trois tentatives, trop arrondi sans tentative) puis deux choix fermés (une tentative,
 * jugés ✗ / ✓, message ciblé avec la réponse). */
export const DEFINITION_COVARIANCE_CORRELATION: DefinitionEcrans<ExerciceCorrelation, PhaseCorrelation> = {
  phases,
  estChoix,
  mode: (e, p) => (estChoix(e, p) ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureEcran(e),
  tableau,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  approchee,
  piege,
  piegeChoixRevele: true,
  bonneOption,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeCorrelation,
};
