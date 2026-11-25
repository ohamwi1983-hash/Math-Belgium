import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDroiteMayer } from "./core5e/droiteMayer";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDroiteMayer } from "./generateurs5e/droiteMayer";
import { DEFINITION_DROITE_MAYER } from "./ui5e/definitionDroiteMayer";
import type { PhaseDroiteMayer } from "./ui5e/formatDroiteMayer";

/**
 * `5gen36` — « Droite de Mayer » (5e ch. 6, § 3, processus 2 APPLIQUER) : trier, partager (n pair ou
 * impair), G₁ et G₂, pente, équation, G sur la droite, prévision ; le nuage s'enrichit écran après écran.
 * Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que `generateurs5e/droiteMayer/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDroiteMayer, PhaseDroiteMayer> = {
  id: "5gen36",
  titre: "Droite de Mayer",
  definition: DEFINITION_DROITE_MAYER,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDroiteMayer,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen36() {
  return <AppEcransTrigo config={CONFIG} />;
}
