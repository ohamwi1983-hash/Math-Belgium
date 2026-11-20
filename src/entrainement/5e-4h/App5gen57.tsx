import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceRelevesSinusoide } from "./core5e/relevesSinusoide";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelevesSinusoide } from "./generateurs5e/relevesSinusoide";
import type { IdVarianteReleves } from "./generateurs5e/relevesSinusoide";
import { DEFINITION_RELEVES_SINUSOIDE } from "./ui5e/definitionRelevesSinusoide";
import type { PhaseReleves } from "./ui5e/formatRelevesSinusoide";

/**
 * `5gen57` — « Modéliser des relevés réels par une sinusoïde » (5e ch. 2, § 8, processus 3
 * TRANSFÉRER, calculatrice indispensable). Marée, durée du jour ou températures mensuelles : lire
 * max, min et T, calculer A, b, ω, puis φ par le maximum, prévoir une valeur, calculer la durée
 * au-dessus d'un seuil. `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceRelevesSinusoide, PhaseReleves> = {
  id: "5gen57",
  titre: "Modéliser des relevés réels par une sinusoïde",
  definition: DEFINITION_RELEVES_SINUSOIDE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceRelevesSinusoide,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteReleves),
};

export function App5gen57() {
  return <AppEcransTrigo config={CONFIG} />;
}
