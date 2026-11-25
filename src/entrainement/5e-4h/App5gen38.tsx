import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceCorrelation } from "./core5e/covarianceCorrelation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCorrelation } from "./generateurs5e/covarianceCorrelation";
import { DEFINITION_COVARIANCE_CORRELATION } from "./ui5e/definitionCovarianceCorrelation";
import type { PhaseCorrelation } from "./ui5e/formatCovarianceCorrelation";

/**
 * `5gen38` — « Covariance et coefficient de corrélation » (5e ch. 6, § 5, processus 2 APPLIQUER) :
 * covariance par les deux formules, σx et σy, r, sens et intensité (tableau du cours) ; ou, à la
 * calculatrice, σ, r, covariance et interprétation. Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/covarianceCorrelation/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCorrelation, PhaseCorrelation> = {
  id: "5gen38",
  titre: "Covariance et coefficient de corrélation",
  definition: DEFINITION_COVARIANCE_CORRELATION,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCorrelation,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen38() {
  return <AppEcransTrigo config={CONFIG} />;
}
