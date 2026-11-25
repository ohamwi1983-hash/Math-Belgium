import type { ExerciceBinomialeSequenceOrdonnee } from "./core6e/binomialeSequenceOrdonnee.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import type { IdVarianteBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import type { PhaseBinomialeSequenceOrdonnee } from "./moteur6e/typesBinomialeSequenceOrdonnee";
import { phasesPourExercice } from "./moteur6e/typesBinomialeSequenceOrdonnee";
import { correctionDetailleeBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { DEFINITION_6GEN48, attentesBinomialeSequenceOrdonnee } from "./moteur6e/verificationBinomialeSequenceOrdonnee";
import { FORMAT_6GEN48 } from "./ui6e/formatBinomialeSequenceOrdonnee";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen48` — Probabilité binomiale et séquence exacte (6e ch. 7, § 6, processus 2 APPLIQUER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceBinomialeSequenceOrdonnee, PhaseBinomialeSequenceOrdonnee> = {
  id: "6gen48",
  titre: "Probabilité binomiale et séquence exacte",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceBinomialeSequenceOrdonnee,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteBinomialeSequenceOrdonnee),
  definition: DEFINITION_6GEN48,
  attentes: attentesBinomialeSequenceOrdonnee,
  format: FORMAT_6GEN48,
  pucesAvantPremierEcran: (e) => (e.famille === "A" ? 4 : null),
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeBinomialeSequenceOrdonnee(e), phasesPourExercice(e), p)} />,
};

export function App6gen48() {
  return <AppCombinatoire config={CONFIG} />;
}
