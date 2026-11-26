import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceAnnuites, PhaseAnnuites } from "./generateurs56/annuites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnnuites } from "./generateurs56/annuites";
import { DEFINITION_ANNUITES } from "./generateurs56/annuites/definition";

/**
 * `56gen27` — « Annuités : placement et remboursement » (5e (6h), « Nombres réels et suites », étape 13).
 * Socle d'écrans partagé ; `?code=` : mêmes fonctions que `generateurs56/annuites/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceAnnuites, PhaseAnnuites> = {
  id: "56gen27",
  titre: "Annuités : placement et remboursement",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_ANNUITES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceAnnuites,
  genererVariante: construireAvecVarianteId,
};

export function App56gen27() {
  return <AppEcransTrigo config={CONFIG} />;
}
