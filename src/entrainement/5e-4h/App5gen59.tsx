import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceLireDomaine } from "./core5e/lireDomaineImage";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireDomaine } from "./generateurs5e/lireDomaineImage";
import { DEFINITION_LIRE_DOMAINE } from "./ui5e/definitionLireDomaine";
import type { PhaseLireDomaine } from "./ui5e/formatLireDomaine";

/**
 * `5gen59` — « Lire domaine et image sur un graphique » (5e ch. 1, intro et § 1, processus 1
 * CONNAÎTRE). Trois écrans de lecture : dom f, Im f (ensembles saisis librement : crochets, ∪, ±∞,
 * ℝ, ℝ \ {a}), puis « f(a) existe-t-il ? » (choix fermé, verdict 50/50). `?code=` : mêmes
 * fonctions que `generateurs5e/lireDomaineImage/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLireDomaine, PhaseLireDomaine> = {
  id: "5gen59",
  titre: "Lire domaine et image sur un graphique",
  definition: DEFINITION_LIRE_DOMAINE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLireDomaine,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 380,
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen59() {
  return <AppEcransTrigo config={CONFIG} />;
}
