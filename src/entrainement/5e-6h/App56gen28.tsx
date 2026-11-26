import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceCredit, PhaseCredit } from "./generateurs56/credit";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCredit } from "./generateurs56/credit";
import { DEFINITION_CREDIT } from "./generateurs56/credit/definition";

/**
 * `56gen28` — « Crédit et tableau d'amortissement » (5e (6h), « Nombres réels et suites », étape 14).
 * Socle d'écrans partagé ; `?code=` : mêmes fonctions que `generateurs56/credit/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCredit, PhaseCredit> = {
  id: "56gen28",
  titre: "Crédit et tableau d'amortissement",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_CREDIT,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCredit,
  genererVariante: construireAvecVarianteId,
};

export function App56gen28() {
  return <AppEcransTrigo config={CONFIG} />;
}
