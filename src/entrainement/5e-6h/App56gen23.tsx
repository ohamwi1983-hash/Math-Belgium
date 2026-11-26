import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceQuelleFormule, PhaseQuelleFormule } from "./generateurs56/quelleFormule";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuelleFormule } from "./generateurs56/quelleFormule";
import { DEFINITION_QUELLE_FORMULE } from "./generateurs56/quelleFormule/definition";

/**
 * `56gen23` — « Quelle formule ? Reconnaître le problème financier » (5e (6h), « Nombres réels et suites »,
 * étape 14, en dernier) : famille, grandeur cherchée, formule (choix fermés jugés, une tentative).
 * Socle d'écrans partagé ; `?code=` : mêmes fonctions que `generateurs56/quelleFormule/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceQuelleFormule, PhaseQuelleFormule> = {
  id: "56gen23",
  titre: "Quelle formule ? Reconnaître le problème financier",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_QUELLE_FORMULE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceQuelleFormule,
  genererVariante: construireAvecVarianteId,
};

export function App56gen23() {
  return <AppEcransTrigo config={CONFIG} />;
}
