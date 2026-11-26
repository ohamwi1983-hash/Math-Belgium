import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceQuantif, PhaseQuantif } from "./generateurs56/quantificateursAxiomes/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuantif } from "./generateurs56/quantificateursAxiomes";
import type { IdVarianteQuantif } from "./generateurs56/quantificateursAxiomes";
import { DEFINITION_QUANTIF } from "./generateurs56/quantificateursAxiomes/ui/definition";

/**
 * `56gen17` — « Énoncés quantifiés et axiomes » (5e (6h), « Nombres réels et suites », étape 3,
 * processus 1 CONNAÎTRE). Vrai ou faux d'énoncés à quantificateurs et négation ; axiome qui justifie
 * chaque étape d'un calcul. Socle d'écrans du 5e (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que
 * l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceQuantif, PhaseQuantif> = {
  id: "56gen17",
  titre: "Énoncés quantifiés et axiomes",
  definition: DEFINITION_QUANTIF,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceQuantif,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteQuantif),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen17() {
  return <AppEcransTrigo config={CONFIG} />;
}
