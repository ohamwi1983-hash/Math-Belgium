import type { ExerciceIdentificationConiques } from "./core6e/identificationConiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./generateurs6e/identificationConiques";
import type { PhaseIdentificationConiques } from "./moteur6e/typesIdentificationConiques";
import { pucesMasquees6gen58 } from "./moteur6e/typesIdentificationConiques";
import { DEFINITION_6GEN58, attentesIdentificationConiques } from "./moteur6e/verificationIdentificationConiques";
import { FORMAT_6GEN58, figure6gen58 } from "./ui6e/formatIdentificationConiques";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen58` — Identifier une conique et ses éléments (6e ch. 10, § 1–2, processus 2 APPLIQUER ; audit du
 * chapitre, lots B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`, comme le ch. 9) : la nature est
 * un choix fermé à une tentative, tiré à parts égales ; le nombre d'écrans qui suivent est masqué tant
 * qu'elle n'est pas jugée. Figure : la conique (ou le point, les droites) APRÈS la nature, puis foyers,
 * asymptotes ou directrice après les éléments. Le corrigé détaillé (lot E) se branchera sur
 * `corrigeDetaille` ; d'ici là, l'explication du format sert de corrigé après chaque réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceIdentificationConiques, PhaseIdentificationConiques> = {
  id: "6gen58",
  titre: "Identifier et caractériser une conique",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceIdentificationConiques,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN58,
  attentes: attentesIdentificationConiques,
  recapSepare: true,
  format: FORMAT_6GEN58,
  complement: (e, _p, closes) => {
    const svg = figure6gen58(e, closes);
    return svg ? <FigureLieux svg={svg} /> : null;
  },
  pucesMasquees: pucesMasquees6gen58,
};

export function App6gen58() {
  return <AppCombinatoire config={CONFIG} />;
}
