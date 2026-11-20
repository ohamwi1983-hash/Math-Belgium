import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceComposeePoint } from "./core5e/composeePoint";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposeePoint } from "./generateurs5e/composeePoint";
import { DEFINITION_COMPOSEE_POINT } from "./ui5e/definitionComposeePoint";
import type { PhaseComposeePoint } from "./ui5e/formatComposeePoint";

/**
 * `5gen60` — « Composée en un point » (5e ch. 1, § 2, processus 2 APPLIQUER). Trois écrans : la
 * fonction appliquée d'abord et la valeur intermédiaire ; l'existence (choix fermé, une tentative,
 * verdict « n'existe pas » ≈ 40 %) ; la valeur exacte (si la composée existe — trois puces dans les
 * deux cas). `?code=` : mêmes fonctions que `generateurs5e/composeePoint/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceComposeePoint, PhaseComposeePoint> = {
  id: "5gen60",
  titre: "Composée en un point",
  definition: DEFINITION_COMPOSEE_POINT,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceComposeePoint,
  genererVariante: construireAvecVarianteId,
  nombrePuces: 3,
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen60() {
  return <AppEcransTrigo config={CONFIG} />;
}
