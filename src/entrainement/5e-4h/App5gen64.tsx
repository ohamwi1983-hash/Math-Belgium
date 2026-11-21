import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceConjuguee } from "./core5e/limitesConjuguee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConjuguee } from "./generateurs5e/limitesConjuguee";
import { DEFINITION_LIMITES_CONJUGUEE } from "./ui5e/definitionLimitesConjuguee";
import type { PhaseConjuguee } from "./ui5e/formatLimitesConjuguee";

/**
 * `5gen64` — « Limites avec racines carrées : expression conjuguée » (5e ch. 4, § 1, processus 2
 * APPLIQUER). Forme (choix fermé), transformation (conjuguée + produit remarquable, ou x² mis en
 * évidence en −∞), limites partielles, conclusion exacte. Socle d'écrans du 5e (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que `generateurs5e/limitesConjuguee/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceConjuguee, PhaseConjuguee> = {
  id: "5gen64",
  titre: "Limites avec racines carrées : expression conjuguée",
  definition: DEFINITION_LIMITES_CONJUGUEE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceConjuguee,
  genererVariante: construireAvecVarianteId,
  sousTitre: "Chapitre 4 — Limites et asymptotes",
};

export function App5gen64() {
  return <AppEcransTrigo config={CONFIG} />;
}
