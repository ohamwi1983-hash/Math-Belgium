import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceSansAbs, PhaseSansAbs } from "./generateurs56/sansValeurAbsolue/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSansAbs } from "./generateurs56/sansValeurAbsolue";
import type { IdVarianteSansAbs } from "./generateurs56/sansValeurAbsolue";
import { DEFINITION_SANS_ABS } from "./generateurs56/sansValeurAbsolue/ui/definition";

/**
 * `56gen19` — « Écrire sans valeur absolue » (5e (6h), « Nombres réels et suites », étape 4, processus 2
 * APPLIQUER). Zéros rangés, puis l'expression réduite sur chaque intervalle. Socle d'écrans du 5e
 * (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceSansAbs, PhaseSansAbs> = {
  id: "56gen19",
  titre: "Écrire sans valeur absolue",
  definition: DEFINITION_SANS_ABS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceSansAbs,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteSansAbs),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen19() {
  return <AppEcransTrigo config={CONFIG} />;
}
