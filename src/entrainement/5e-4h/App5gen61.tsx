import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceComposerPolynomes } from "./core5e/composerPolynomes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposerPolynomes } from "./generateurs5e/composerPolynomes";
import type { IdVarianteComposerPolynomes } from "./generateurs5e/composerPolynomes";
import { DEFINITION_COMPOSER_POLYNOMES } from "./ui5e/definitionComposerPolynomes";
import type { PhaseComposerPolynomes } from "./ui5e/formatComposerPolynomes";

/**
 * `5gen61` — « Composer des polynômes » (5e ch. 1, § 3, processus 2 APPLIQUER). f et g affines ou
 * l'une du second degré : f(g(x)) écrit, (f∘g)(x) et (g∘f)(x) développées et réduites, vérification
 * en un point, verdict f∘g = g∘f pour deux affines. Socle d'écrans du 5e ch. 2 (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceComposerPolynomes, PhaseComposerPolynomes> = {
  id: "5gen61",
  titre: "Composer des polynômes",
  definition: DEFINITION_COMPOSER_POLYNOMES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceComposerPolynomes,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteComposerPolynomes),
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen61() {
  return <AppEcransTrigo config={CONFIG} />;
}
