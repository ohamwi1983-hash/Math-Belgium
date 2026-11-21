import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceFonctionAsymptotes } from "./core5e/fonctionAsymptotes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionAsymptotes } from "./generateurs5e/fonctionAsymptotes";
import { DEFINITION_FONCTION_ASYMPTOTES } from "./ui5e/definitionFonctionAsymptotes";
import type { PhaseFonctionAsymptotes } from "./ui5e/formatFonctionAsymptotes";

/**
 * `5gen65` — « Retrouver une fonction à partir de ses asymptotes » (5e ch. 4, § 5, processus 2
 * APPLIQUER). Forme donnée, asymptotes et un point (ou un graphique complet) : asymptote verticale,
 * horizontale / oblique, point, f(x), vérification par la limite à droite. Socle `AppEcransTrigo` ;
 * `?code=` : mêmes fonctions que `generateurs5e/fonctionAsymptotes/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceFonctionAsymptotes, PhaseFonctionAsymptotes> = {
  id: "5gen65",
  titre: "Retrouver une fonction à partir de ses asymptotes",
  definition: DEFINITION_FONCTION_ASYMPTOTES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceFonctionAsymptotes,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 380,
  sousTitre: "Chapitre 4 — Limites et asymptotes",
};

export function App5gen65() {
  return <AppEcransTrigo config={CONFIG} />;
}
