import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceDecimale, PhaseDecimale } from "./generateurs56/ecritureDecimale/core/types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDecimale } from "./generateurs56/ecritureDecimale";
import type { IdVarianteDecimale } from "./generateurs56/ecritureDecimale";
import { DEFINITION_DECIMALE } from "./generateurs56/ecritureDecimale/ui/definition";

/**
 * `56gen16` — « Écriture décimale et fraction » (5e (6h), « Nombres réels et suites », étape 2,
 * processus 2 APPLIQUER). Fraction → écriture périodique ; écriture périodique → fraction ; limitée ou
 * périodique selon le dénominateur. Socle d'écrans du 5e (`AppEcransTrigo`) ; `?code=` : mêmes
 * fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceDecimale, PhaseDecimale> = {
  id: "56gen16",
  titre: "Écriture décimale et fraction",
  definition: DEFINITION_DECIMALE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDecimale,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteDecimale),
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
};

export function App56gen16() {
  return <AppEcransTrigo config={CONFIG} />;
}
