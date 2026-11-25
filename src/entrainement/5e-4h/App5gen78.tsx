import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceModeliserPrevoir } from "./core5e/modeliserPrevoir";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeliserPrevoir } from "./generateurs5e/modeliserPrevoir";
import { DEFINITION_MODELISER_PREVOIR } from "./ui5e/definitionModeliserPrevoir";
import type { PhaseModeliser } from "./ui5e/formatModeliserPrevoir";

/**
 * `5gen78` — « Modéliser et prévoir en contexte » (5e ch. 6, § 6, processus 3 TRANSFÉRER, calculatrice
 * indispensable). Série réaliste : droite des moindres carrés et r à la calculatrice, fiabilité,
 * prévision (interpolation ou extrapolation), seuil. Socle `AppEcransTrigo` ; `?code=` : mêmes
 * fonctions que `generateurs5e/modeliserPrevoir/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceModeliserPrevoir, PhaseModeliser> = {
  id: "5gen78",
  titre: "Modéliser et prévoir en contexte",
  definition: DEFINITION_MODELISER_PREVOIR,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceModeliserPrevoir,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 400,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen78() {
  return <AppEcransTrigo config={CONFIG} />;
}
