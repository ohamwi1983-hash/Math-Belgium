import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceInteretSimple, PhaseInteretSimple } from "./generateurs56/interetSimple";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretSimple } from "./generateurs56/interetSimple";
import { DEFINITION_INTERET_SIMPLE } from "./generateurs56/interetSimple/definition";

/**
 * `56gen24` — « Intérêt simple » (5e (6h), « Nombres réels et suites », étape 11) : valeur acquise sur
 * des jours exacts, des mois, des quinzaines ; retrouver le capital, le taux ou la durée. Socle d'écrans
 * partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que `generateurs56/interetSimple/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceInteretSimple, PhaseInteretSimple> = {
  id: "56gen24",
  titre: "Intérêt simple",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_INTERET_SIMPLE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceInteretSimple,
  genererVariante: construireAvecVarianteId,
};

export function App56gen24() {
  return <AppEcransTrigo config={CONFIG} />;
}
