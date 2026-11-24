import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceFonctionConditions } from "./core5e/fonctionConditions";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionConditions } from "./generateurs5e/fonctionConditions";
import { DEFINITION_FONCTION_CONDITIONS } from "./ui5e/definitionFonctionConditions";
import type { PhaseFonctionConditions } from "./ui5e/formatFonctionConditions";

/**
 * `5gen69` — « Déterminer une fonction par des conditions » (5e ch. 5, § 5, processus 3
 * TRANSFÉRER) : f(x) = ax³ + bx² + cx + d — conditions directes, système, résolution, dérivée,
 * nature du point (signe de f′ ou de f″). Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/fonctionConditions/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceFonctionConditions, PhaseFonctionConditions> = {
  id: "5gen69",
  titre: "Déterminer une fonction par des conditions",
  definition: DEFINITION_FONCTION_CONDITIONS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceFonctionConditions,
  genererVariante: construireAvecVarianteId,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen69() {
  return <AppEcransTrigo config={CONFIG} />;
}
