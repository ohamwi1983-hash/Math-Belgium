import type { ExerciceDenombrementFondamental } from "./core6e/denombrementFondamental.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import type { IdVarianteDenombrementFondamental } from "./generateurs6e/denombrementFondamental";
import type { PhaseDenombrementFondamental } from "./moteur6e/typesDenombrementFondamental";
import { DEFINITION_6GEN43, attentesDenombrementFondamental } from "./moteur6e/verificationDenombrementFondamental";
import { FORMAT_6GEN43 } from "./ui6e/formatDenombrementFondamental";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen43` — Dénombrement fondamental et arrangements (6e ch. 7, § 1, processus 2 APPLIQUER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceDenombrementFondamental, PhaseDenombrementFondamental> = {
  id: "6gen43",
  titre: "Dénombrement fondamental et arrangements",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDenombrementFondamental,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteDenombrementFondamental),
  definition: DEFINITION_6GEN43,
  attentes: attentesDenombrementFondamental,
  format: FORMAT_6GEN43,
};

export function App6gen43() {
  return <AppCombinatoire config={CONFIG} />;
}
