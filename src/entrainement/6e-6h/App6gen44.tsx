import type { ExerciceDenombrementCombine } from "./core6e/denombrementCombine.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombine } from "./generateurs6e/denombrementCombine";
import type { IdVarianteDenombrementCombine } from "./generateurs6e/denombrementCombine";
import type { PhaseDenombrementCombine } from "./moteur6e/typesDenombrementCombine";
import { DEFINITION_6GEN44, attentesDenombrementCombine } from "./moteur6e/verificationDenombrementCombine";
import { FORMAT_6GEN44 } from "./ui6e/formatDenombrementCombine";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen44` — Dénombrement combiné et sélections contraintes (6e ch. 7, § 2, processus 2 APPLIQUER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceDenombrementCombine, PhaseDenombrementCombine> = {
  id: "6gen44",
  titre: "Dénombrement combiné et sélections contraintes",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDenombrementCombine,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteDenombrementCombine),
  definition: DEFINITION_6GEN44,
  attentes: attentesDenombrementCombine,
  format: FORMAT_6GEN44,
};

export function App6gen44() {
  return <AppCombinatoire config={CONFIG} />;
}
