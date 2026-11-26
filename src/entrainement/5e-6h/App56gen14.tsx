import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceRationnel, PhaseRationnel } from "./generateurs56/rationnelIrrationnel/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRationnel } from "./generateurs56/rationnelIrrationnel";
import type { IdVarianteRationnel } from "./generateurs56/rationnelIrrationnel";
import { DEFINITION_RATIONNEL } from "./generateurs56/rationnelIrrationnel/ui/definition";

/**
 * `56gen14` — « Rationnel ou irrationnel ? » (5e (6h), « Nombres réels et suites », étape 1, processus
 * 1 CONNAÎTRE). Quatre nombres, un choix fermé par nombre (ℕ, ℤ, ℚ, ℝ∖ℚ). Socle d'écrans du 5e
 * (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceRationnel, PhaseRationnel> = {
  id: "56gen14",
  titre: "Rationnel ou irrationnel ?",
  definition: DEFINITION_RATIONNEL,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceRationnel,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteRationnel),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen14() {
  return <AppEcransTrigo config={CONFIG} />;
}
