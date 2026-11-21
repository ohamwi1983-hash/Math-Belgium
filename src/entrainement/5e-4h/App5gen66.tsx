import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceTableauLimites } from "./core5e/tableauLimitesGraphique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTableauLimites } from "./generateurs5e/tableauLimitesGraphique";
import { DEFINITION_TABLEAU_LIMITES } from "./ui5e/definitionTableauLimites";
import type { PhaseTableauLimites } from "./ui5e/formatTableauLimites";

/**
 * `5gen66` — « Du tableau de limites au graphique » (5e ch. 4, § 3, processus 1 CONNAÎTRE). Un
 * tableau de limites, quatre graphiques (trois intrus = erreurs classiques) : choisir le bon (une
 * tentative), puis écrire les asymptotes. Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/tableauLimitesGraphique/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTableauLimites, PhaseTableauLimites> = {
  id: "5gen66",
  titre: "Du tableau de limites au graphique",
  definition: DEFINITION_TABLEAU_LIMITES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTableauLimites,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 420,
  sousTitre: "Chapitre 4 — Limites et asymptotes",
};

export function App5gen66() {
  return <AppEcransTrigo config={CONFIG} />;
}
