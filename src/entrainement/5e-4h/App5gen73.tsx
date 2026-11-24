import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceLectureTangente } from "./core5e/lectureTangente";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureTangente } from "./generateurs5e/lectureTangente";
import { DEFINITION_LECTURE_TANGENTE } from "./ui5e/definitionLectureTangente";
import type { PhaseLectureTangente } from "./ui5e/formatLectureTangente";

/**
 * `5gen73` — « Lire f(a) et f′(a) sur un graphique » (5e ch. 5, § 1–2 et § 6, processus 1
 * CONNAÎTRE) : f(a) lu, f′(a) par Δy / Δx sur la tangente tracée, équation de la tangente,
 * comparaison des nombres dérivés en trois points ; variante inverse : tangente donnée par son
 * équation, choisir le graphique. Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/lectureTangente/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLectureTangente, PhaseLectureTangente> = {
  id: "5gen73",
  titre: "Lire f(a) et f′(a) sur un graphique",
  definition: DEFINITION_LECTURE_TANGENTE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLectureTangente,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen73() {
  return <AppEcransTrigo config={CONFIG} />;
}
