import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceCorrelationCausalite } from "./generateurs5e/correlationCausalite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCorrelationCausalite } from "./generateurs5e/correlationCausalite";
import { DEFINITION_CORRELATION_CAUSALITE } from "./ui5e/formatCorrelationCausalite";
import type { PhaseCorrelation } from "./ui5e/formatCorrelationCausalite";

/**
 * `5gen80` — « Corrélation ou causalité ? » (5e ch. 6, § 6, processus 3 TRANSFÉRER) : une situation
 * rédigée (banque relue de 45 situations), le type d'explication puis l'explication précise (choix
 * fermés, une tentative). Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/correlationCausalite/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCorrelationCausalite, PhaseCorrelation> = {
  id: "5gen80",
  titre: "Corrélation ou causalité ?",
  definition: DEFINITION_CORRELATION_CAUSALITE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCorrelationCausalite,
  genererVariante: construireAvecVarianteId,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen80() {
  return <AppEcransTrigo config={CONFIG} />;
}
