import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceTauxInstantane } from "./core5e/tauxInstantane";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTauxInstantane } from "./generateurs5e/tauxInstantane";
import { DEFINITION_TAUX_INSTANTANE } from "./ui5e/definitionTauxInstantane";
import type { PhaseTauxInstantane } from "./ui5e/formatTauxInstantane";

/**
 * `5gen70` — « Taux de variation instantané en contexte » (5e ch. 5, § 3, processus 2 APPLIQUER) :
 * taux moyen sur [a ; b], dérivée, taux instantané f′(a), unité, interprétation. Socle
 * `AppEcransTrigo` ; `?code=` : mêmes fonctions que `generateurs5e/tauxInstantane/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTauxInstantane, PhaseTauxInstantane> = {
  id: "5gen70",
  titre: "Taux de variation instantané en contexte",
  definition: DEFINITION_TAUX_INSTANTANE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTauxInstantane,
  genererVariante: construireAvecVarianteId,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen70() {
  return <AppEcransTrigo config={CONFIG} />;
}
