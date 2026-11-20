import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceArchimedePi } from "./core5e/archimedePi";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceArchimedePi } from "./generateurs5e/archimedePi";
import type { IdVarianteArchimede } from "./generateurs5e/archimedePi";
import { DEFINITION_ARCHIMEDE_PI } from "./ui5e/definitionArchimedePi";
import type { PhaseArchimede } from "./ui5e/formatArchimedePi";

/**
 * `5gen56` — « Encadrer π comme Archimède » (5e ch. 2, § 1, processus 2 APPLIQUER, calculatrice
 * indispensable). Cinq écrans : α = 180°/n, côtés 2r sin α et 2r tan α, encadrement n sin α ≤ π ≤
 * n tan α, doublement, nombre de côtés pour une largeur sous un seuil. Figure du cours (polygones
 * inscrit et circonscrit). `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceArchimedePi, PhaseArchimede> = {
  id: "5gen56",
  titre: "Encadrer π comme Archimède",
  definition: DEFINITION_ARCHIMEDE_PI,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceArchimedePi,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteArchimede),
  largeurFigure: 320,
};

export function App5gen56() {
  return <AppEcransTrigo config={CONFIG} />;
}
