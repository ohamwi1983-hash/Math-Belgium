import type { ExerciceBinomeNewton } from "./core6e/binomeNewton.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomeNewton } from "./generateurs6e/binomeNewton";
import type { IdVarianteBinomeNewton } from "./generateurs6e/binomeNewton";
import type { PhaseBinomeNewton } from "./moteur6e/typesBinomeNewton";
import { DEFINITION_6GEN45, attentesBinomeNewton } from "./moteur6e/verificationBinomeNewton";
import { FORMAT_6GEN45 } from "./ui6e/formatBinomeNewton";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen45` — Binôme de Newton (6e ch. 7, § 3, processus 2 APPLIQUER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceBinomeNewton, PhaseBinomeNewton> = {
  id: "6gen45",
  titre: "Binôme de Newton",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceBinomeNewton,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteBinomeNewton),
  definition: DEFINITION_6GEN45,
  attentes: attentesBinomeNewton,
  format: FORMAT_6GEN45,
};

export function App6gen45() {
  return <AppCombinatoire config={CONFIG} />;
}
