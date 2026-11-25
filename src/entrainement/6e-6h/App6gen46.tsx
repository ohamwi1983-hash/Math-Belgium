import type { ExerciceDenombrementCombinatoirePur } from "./core6e/denombrementCombinatoirePur.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import type { IdVarianteDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur";
import type { PhaseDenombrementCombinatoirePur } from "./moteur6e/typesDenombrementCombinatoirePur";
import { phasesPourExercice } from "./moteur6e/typesDenombrementCombinatoirePur";
import { correctionDetailleeDenombrementCombinatoirePur } from "./generateurs6e/denombrementCombinatoirePur/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { DEFINITION_6GEN46, attentesDenombrementCombinatoirePur } from "./moteur6e/verificationDenombrementCombinatoirePur";
import { FORMAT_6GEN46 } from "./ui6e/formatDenombrementCombinatoirePur";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen46` — Dénombrement combinatoire pur : problèmes (6e ch. 7, § 4, processus 3 TRANSFÉRER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceDenombrementCombinatoirePur, PhaseDenombrementCombinatoirePur> = {
  id: "6gen46",
  titre: "Dénombrement combinatoire pur : problèmes",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDenombrementCombinatoirePur,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteDenombrementCombinatoirePur),
  definition: DEFINITION_6GEN46,
  attentes: attentesDenombrementCombinatoirePur,
  format: FORMAT_6GEN46,
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeDenombrementCombinatoirePur(e), phasesPourExercice(e), p)} />,
};

export function App6gen46() {
  return <AppCombinatoire config={CONFIG} />;
}
