import type { ExerciceProbabiliteHypergeometrique } from "./core6e/probabiliteHypergeometrique.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import type { IdVarianteProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique";
import type { PhaseProbabiliteHypergeometrique } from "./moteur6e/typesProbabiliteHypergeometrique";
import { phasesPourExercice } from "./moteur6e/typesProbabiliteHypergeometrique";
import { correctionDetailleeProbabiliteHypergeometrique } from "./generateurs6e/probabiliteHypergeometrique/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { DEFINITION_6GEN47, attentesProbabiliteHypergeometrique } from "./moteur6e/verificationProbabiliteHypergeometrique";
import { FORMAT_6GEN47 } from "./ui6e/formatProbabiliteHypergeometrique";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";

/**
 * `6gen47` — Probabilité hypergéométrique (tirage sans remise) (6e ch. 7, § 5, processus 2 APPLIQUER).
 * Socle commun du chapitre (`AppCombinatoire`) : `?code=`, illisible gratuit, choix fermés seuls sur
 * leur écran à une tentative, aides à deux niveaux, explication après échec.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceProbabiliteHypergeometrique, PhaseProbabiliteHypergeometrique> = {
  id: "6gen47",
  titre: "Probabilité hypergéométrique (tirage sans remise)",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceProbabiliteHypergeometrique,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteProbabiliteHypergeometrique),
  definition: DEFINITION_6GEN47,
  attentes: attentesProbabiliteHypergeometrique,
  format: FORMAT_6GEN47,
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeProbabiliteHypergeometrique(e), phasesPourExercice(e), p)} />,
};

export function App6gen47() {
  return <AppCombinatoire config={CONFIG} />;
}
