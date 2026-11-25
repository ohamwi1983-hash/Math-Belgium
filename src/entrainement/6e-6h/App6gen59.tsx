import type { ExerciceEquationConiqueCaracteristiques } from "./core6e/equationConiqueCaracteristiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationConiqueCaracteristiques } from "./generateurs6e/equationConiqueCaracteristiques";
import type { PhaseEquationConiqueCaracteristiques } from "./moteur6e/typesEquationConiqueCaracteristiques";
import { DEFINITION_6GEN59, attentesEquationConiqueCaracteristiques } from "./moteur6e/verificationEquationConiqueCaracteristiques";
import { FORMAT_6GEN59, figure6gen59 } from "./ui6e/formatEquationConiqueCaracteristiques";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen59` — Équation d'une conique depuis ses caractéristiques (6e ch. 10, § 1–2, processus 2
 * APPLIQUER ; audit, lots B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`). Figure : les données
 * (sommets, foyers, asymptotes, point), la conique tracée APRÈS l'équation.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceEquationConiqueCaracteristiques, PhaseEquationConiqueCaracteristiques> = {
  id: "6gen59",
  titre: "Équation d'une conique depuis ses caractéristiques",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceEquationConiqueCaracteristiques,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN59,
  attentes: attentesEquationConiqueCaracteristiques,
  recapSepare: true,
  format: FORMAT_6GEN59,
  complement: (e, _p, closes) => {
    const svg = figure6gen59(e, closes);
    return svg ? <FigureLieux svg={svg} /> : null;
  },
};

export function App6gen59() {
  return <AppCombinatoire config={CONFIG} />;
}
