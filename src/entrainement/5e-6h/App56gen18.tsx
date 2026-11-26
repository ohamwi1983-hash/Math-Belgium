import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceAbsolue, PhaseAbsolue } from "./generateurs56/valeurAbsolueEquations/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAbsolue } from "./generateurs56/valeurAbsolueEquations";
import type { IdVarianteAbsolue } from "./generateurs56/valeurAbsolueEquations";
import { DEFINITION_ABSOLUE } from "./generateurs56/valeurAbsolueEquations/ui/definition";

/**
 * `56gen18` — « Équations et inéquations avec valeurs absolues » (5e (6h), « Nombres réels et suites »,
 * étape 4, processus 2 APPLIQUER). Socle d'écrans du 5e (`AppEcransTrigo`) ; réponse = ensemble tapé
 * librement (lecture `ensemblesReels.lireEnsemble`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceAbsolue, PhaseAbsolue> = {
  id: "56gen18",
  titre: "Équations et inéquations avec valeurs absolues",
  definition: DEFINITION_ABSOLUE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceAbsolue,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteAbsolue),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen18() {
  return <AppEcransTrigo config={CONFIG} />;
}
