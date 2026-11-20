import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceComposeeDiagonale } from "./core5e/composeeDiagonale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposeeDiagonale } from "./generateurs5e/composeeDiagonale";
import type { IdVarianteComposeeDiagonale } from "./generateurs5e/composeeDiagonale";
import { DEFINITION_COMPOSEE_DIAGONALE } from "./ui5e/definitionComposeeDiagonale";
import type { PhaseComposeeDiagonale } from "./ui5e/formatComposeeDiagonale";

/**
 * `5gen63` — « Composée sur un seul repère (droite y = x) » (5e ch. 1, § 4, processus 2
 * APPLIQUER). Cf, Cg et y = x dans le même repère : première lecture, report par la diagonale,
 * existence (verdict 50/50), seconde lecture. Socle d'écrans du 5e ch. 2 (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceComposeeDiagonale, PhaseComposeeDiagonale> = {
  id: "5gen63",
  titre: "Composée sur un seul repère (droite y = x)",
  definition: DEFINITION_COMPOSEE_DIAGONALE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceComposeeDiagonale,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteComposeeDiagonale),
  largeurFigure: 380,
  nombrePuces: 3,
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen63() {
  return <AppEcransTrigo config={CONFIG} />;
}
