import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExercicePhiHorsExtremum } from "./core5e/phiHorsExtremum";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePhiHorsExtremum } from "./generateurs5e/phiHorsExtremum";
import type { IdVariantePhi } from "./generateurs5e/phiHorsExtremum";
import { DEFINITION_PHI_HORS_EXTREMUM } from "./ui5e/definitionPhiHorsExtremum";
import type { PhasePhi } from "./ui5e/formatPhiHorsExtremum";

/**
 * `5gen54` — « Choisir φ quand le départ n'est pas un extremum » (5e ch. 2, § 8, processus 2
 * APPLIQUER). Cinq écrans : A, b et ω ; sin φ ; les deux candidats de ]−π ; π] ; le sens de
 * variation tranche (choix fermé, une tentative) ; premier maximum (vérification du modèle).
 * `?code=` : mêmes fonctions de génération que `generateurs5e/phiHorsExtremum/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExercicePhiHorsExtremum, PhasePhi> = {
  id: "5gen54",
  titre: "Choisir φ quand le départ n'est pas un extremum",
  definition: DEFINITION_PHI_HORS_EXTREMUM,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePhiHorsExtremum,
  genererVariante: (id) => construireAvecVarianteId(id as IdVariantePhi),
};

export function App5gen54() {
  return <AppEcransTrigo config={CONFIG} />;
}
