import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExercicePointMoyen } from "./core5e/pointMoyenStat";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointMoyen } from "./generateurs5e/pointMoyenStat";
import { DEFINITION_POINT_MOYEN_STAT } from "./ui5e/definitionPointMoyenStat";
import type { PhasePointMoyen } from "./ui5e/formatPointMoyenStat";

/**
 * `5gen77` — « Point moyen et valeurs manquantes » (5e ch. 6, § 1, processus 2 APPLIQUER) : G d'un tableau,
 * une ou deux valeurs effacées connaissant G, droite de Mayer depuis G₁ et G₂ et prévisions dans les deux
 * sens. Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que `generateurs5e/pointMoyenStat/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExercicePointMoyen, PhasePointMoyen> = {
  id: "5gen77",
  titre: "Point moyen et valeurs manquantes",
  definition: DEFINITION_POINT_MOYEN_STAT,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePointMoyen,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen77() {
  return <AppEcransTrigo config={CONFIG} />;
}
