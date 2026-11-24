import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceGraphiqueDerivee } from "./core5e/graphiqueDerivee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGraphiqueDerivee } from "./generateurs5e/graphiqueDerivee";
import { DEFINITION_GRAPHIQUE_DERIVEE } from "./ui5e/definitionGraphiqueDerivee";
import type { PhaseGraphiqueDerivee } from "./ui5e/formatGraphiqueDerivee";

/**
 * `5gen74` — « Du graphique de f′ aux variations de f » (5e ch. 5, § 6, processus 2 APPLIQUER) :
 * seul le graphique de f′ est donné ; signe de f′, extremums de f, concavité, points d'inflexion.
 * Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/graphiqueDerivee/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceGraphiqueDerivee, PhaseGraphiqueDerivee> = {
  id: "5gen74",
  titre: "Du graphique de f′ aux variations de f",
  definition: DEFINITION_GRAPHIQUE_DERIVEE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceGraphiqueDerivee,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 330,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen74() {
  return <AppEcransTrigo config={CONFIG} />;
}
