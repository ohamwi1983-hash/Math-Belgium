import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceInequationTrigo } from "./core5e/inequationsTrigo";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequationTrigo } from "./generateurs5e/inequationsTrigo";
import type { IdVarianteInequation } from "./generateurs5e/inequationsTrigo";
import { DEFINITION_INEQUATIONS_TRIGO } from "./ui5e/definitionInequationsTrigo";
import type { PhaseInequation } from "./ui5e/formatInequationsTrigo";

/**
 * `5gen55` — « Inéquations trigonométriques » (5e ch. 2, § 8, processus 2 APPLIQUER). Résoudre dans
 * [0 ; 2π[ : isoler sin u ou cos u (symbole + m), lire l'arc au cercle, revenir à x (période divisée
 * par a), lister les intervalles de la fenêtre. Cas particulier (|m| > 1) : conclusion directe,
 * puces de structure fixe (quatre). `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceInequationTrigo, PhaseInequation> = {
  id: "5gen55",
  titre: "Inéquations trigonométriques",
  definition: DEFINITION_INEQUATIONS_TRIGO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceInequationTrigo,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteInequation),
  largeurFigure: 280,
  nombrePuces: 4,
};

export function App5gen55() {
  return <AppEcransTrigo config={CONFIG} />;
}
