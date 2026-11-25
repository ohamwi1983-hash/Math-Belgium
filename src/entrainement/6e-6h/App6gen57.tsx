import type { ExerciceMethodeGeneratrices } from "./core6e/methodeGeneratrices.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMethodeGeneratrices } from "./generateurs6e/methodeGeneratrices";
import type { PhaseMethodeGeneratrices } from "./moteur6e/typesMethodeGeneratrices";
import { DEFINITION_6GEN57, attentesMethodeGeneratrices } from "./moteur6e/verificationMethodeGeneratrices";
import { FORMAT_6GEN57, figure6gen57 } from "./ui6e/formatMethodeGeneratrices";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";
import { phasesPourExercice } from "./moteur6e/typesMethodeGeneratrices";
import { correctionDetailleeMethodeGeneratrices } from "./generateurs6e/methodeGeneratrices/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";

/**
 * `6gen57` — Problèmes de lieux : méthode des génératrices (6e ch. 9, § 5, processus 3 TRANSFÉRER ;
 * audit du chapitre, lots B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`) : statuts des morceaux
 * et restriction en choix fermés à une tentative, jugés ✗ / ✓ ; élimination ET factorisation sur un
 * seul écran. Figure : la configuration pour une valeur du paramètre, puis le lieu APRÈS la dernière
 * réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceMethodeGeneratrices, PhaseMethodeGeneratrices> = {
  id: "6gen57",
  titre: "Problèmes de lieux : méthode des génératrices",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceMethodeGeneratrices,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN57,
  attentes: attentesMethodeGeneratrices,
  recapSepare: true,
  format: FORMAT_6GEN57,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen57(e, closes)} />,
  // Le nombre de morceaux (donc d'écrans) se lit sur l'équation factorisée : on ne le montre
  // qu'après l'écran d'élimination (il trahirait un facteur y).
  pucesMasquees: () => ({ nombre: 5, jusqua: 1 }),
  // Corrigé « comme au tableau » de l'écran (lot E) : même source que le papier, une lettre par écran.
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeMethodeGeneratrices(e), phasesPourExercice(e), p)} />,
};

export function App6gen57() {
  return <AppCombinatoire config={CONFIG} />;
}
