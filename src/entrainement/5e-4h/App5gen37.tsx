import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceMoindresCarres } from "./core5e/moindresCarres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoindresCarres } from "./generateurs5e/moindresCarres";
import { DEFINITION_MOINDRES_CARRES } from "./ui5e/definitionMoindresCarres";
import type { PhaseMoindresCarres } from "./ui5e/formatMoindresCarres";

/**
 * `5gen37` — « Droite des moindres carrés » (5e ch. 6, § 4, processus 2 APPLIQUER) : à la main sur une
 * petite série (G, tableau des écarts, a, b, prévision) ou à la calculatrice sur une série réelle (a et b
 * arrondis, prévisions dans les deux sens). Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/moindresCarres/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceMoindresCarres, PhaseMoindresCarres> = {
  id: "5gen37",
  titre: "Droite des moindres carrés",
  definition: DEFINITION_MOINDRES_CARRES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceMoindresCarres,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen37() {
  return <AppEcransTrigo config={CONFIG} />;
}
