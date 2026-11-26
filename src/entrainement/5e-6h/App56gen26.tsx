import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceTauxEquivalents, PhaseTauxEquivalents } from "./generateurs56/tauxEquivalents";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTauxEquivalents } from "./generateurs56/tauxEquivalents";
import { DEFINITION_TAUX_EQUIVALENTS } from "./generateurs56/tauxEquivalents/definition";

/**
 * `56gen26` — « Taux équivalents et taux réel » (5e (6h), « Nombres réels et suites », étape 12).
 * Socle d'écrans partagé ; `?code=` : mêmes fonctions que `generateurs56/tauxEquivalents/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTauxEquivalents, PhaseTauxEquivalents> = {
  id: "56gen26",
  titre: "Taux équivalents et taux réel",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_TAUX_EQUIVALENTS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTauxEquivalents,
  genererVariante: construireAvecVarianteId,
};

export function App56gen26() {
  return <AppEcransTrigo config={CONFIG} />;
}
