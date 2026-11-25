import type { ExerciceAireExcentriciteConique } from "./core6e/aireExcentriciteConique.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAireExcentriciteConique } from "./generateurs6e/aireExcentriciteConique";
import type { PhaseAireExcentriciteConique } from "./moteur6e/typesAireExcentriciteConique";
import { DEFINITION_6GEN60, attentesAireExcentriciteConique } from "./moteur6e/verificationAireExcentriciteConique";
import { FORMAT_6GEN60, figure6gen60 } from "./ui6e/formatAireExcentriciteConique";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen60` — Aire, rayons focaux et excentricité (6e ch. 10, § 3, processus 3 TRANSFÉRER ; audit, lots
 * B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`). Figure : l'ellipse, ses foyers et le triangle
 * FPF′ (A) ; la configuration de la condition APRÈS l'excentricité (B : la forme de l'ellipse la
 * trahirait).
 */
const CONFIG: ConfigAppCombinatoire<ExerciceAireExcentriciteConique, PhaseAireExcentriciteConique> = {
  id: "6gen60",
  titre: "Aire, rayons focaux et excentricité",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceAireExcentriciteConique,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN60,
  attentes: attentesAireExcentriciteConique,
  recapSepare: true,
  format: FORMAT_6GEN60,
  complement: (e, _p, closes) => {
    const svg = figure6gen60(e, closes);
    return svg ? <FigureLieux svg={svg} /> : null;
  },
};

export function App6gen60() {
  return <AppCombinatoire config={CONFIG} />;
}
