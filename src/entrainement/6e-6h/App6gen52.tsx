import type { ExerciceExtensionsBinomialeNormaleBayes } from "./core6e/extensionsBinomialeNormaleBayes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./generateurs6e/extensionsBinomialeNormaleBayes";
import type { PhaseExtensionsBinomialeNormaleBayes } from "./moteur6e/typesExtensionsBinomialeNormaleBayes";
import { DEFINITION_6GEN52, attentesExtensions } from "./moteur6e/verificationExtensionsBinomialeNormaleBayes";
import { FORMAT_6GEN52 } from "./ui6e/formatExtensionsBinomialeNormaleBayes";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import { phasesPourExercice } from "./moteur6e/typesExtensionsBinomialeNormaleBayes";
import { correctionDetailleeExtensions } from "./generateurs6e/extensionsBinomialeNormaleBayes/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen52` — Extensions binomiale, normale et Bayes (6e ch. 8, § 7, processus 3 TRANSFÉRER), refondu
 * (audit, lot C) : épreuve composée et « trouver n », vrai théorème de Bayes à trois catégories, loi
 * reconstruite et espérance appliquée. Socle commun du ch. 7 (`AppCombinatoire`) : plus aucun choix
 * posé à côté d'un champ (G17 : « Somme de termes » était recouvert par le champ voisin).
 */
const CONFIG: ConfigAppCombinatoire<ExerciceExtensionsBinomialeNormaleBayes, PhaseExtensionsBinomialeNormaleBayes> = {
  id: "6gen52",
  titre: "Extensions binomiale, normale et Bayes",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceExtensionsBinomialeNormaleBayes,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN52,
  attentes: attentesExtensions,
  format: FORMAT_6GEN52,
  // Corrigé « comme au tableau » de l'écran (lot E) : même source que le papier, une lettre par écran.
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeExtensions(e), phasesPourExercice(e), p)} />,
};

export function App6gen52() {
  return <AppCombinatoire config={CONFIG} />;
}
