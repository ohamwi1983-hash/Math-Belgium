import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceSigma, IdVarianteSigma } from "./generateurs56/sommeSigma";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSigma } from "./generateurs56/sommeSigma";
import { DEFINITION_SIGMA } from "./generateurs56/sommeSigma/ui/definitionSigma";
import type { PhaseSigma } from "./generateurs56/sommeSigma/ui/formatSigma";

/**
 * `56gen21` — « Calculer avec le symbole Σ » (5e (6h), « Nombres réels et suites », étape 7, processus 2
 * APPLIQUER) : écrire une somme avec Σ, développer, somme d'une suite arithmétique ou géométrique,
 * séparer une partie géométrique et une partie arithmétique, somme en fonction de n, changement
 * d'indice. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<ExerciceSigma, PhaseSigma> = {
  id: "56gen21",
  titre: "Calculer avec le symbole Σ",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
  definition: DEFINITION_SIGMA,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceSigma,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteSigma),
};

export function App56gen21() {
  return <AppEcransTrigo config={CONFIG} />;
}
