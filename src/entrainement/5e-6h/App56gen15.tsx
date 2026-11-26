import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceIrrationalite, PhaseIrrationalite } from "./generateurs56/irrationaliteRacine/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIrrationalite } from "./generateurs56/irrationaliteRacine";
import type { IdVarianteIrrationalite } from "./generateurs56/irrationaliteRacine";
import { DEFINITION_IRRATIONALITE } from "./generateurs56/irrationaliteRacine/ui/definition";

/**
 * `56gen15` — « Démontrer qu'un nombre est irrationnel » (5e (6h), « Nombres réels et suites », étape 1,
 * processus 2 APPLIQUER). Démonstration guidée de √N ou ∛N en cinq écrans ; verdict irrationnel /
 * naturel à parts égales. Socle d'écrans du 5e (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que
 * l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceIrrationalite, PhaseIrrationalite> = {
  id: "56gen15",
  titre: "Démontrer qu'un nombre est irrationnel",
  definition: DEFINITION_IRRATIONALITE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceIrrationalite,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteIrrationalite),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen15() {
  return <AppEcransTrigo config={CONFIG} />;
}
