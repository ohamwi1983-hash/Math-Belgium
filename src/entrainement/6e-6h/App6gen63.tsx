import type { ExerciceProprietesOptiquesConiques } from "./core6e/proprietesOptiquesConiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import type { PhaseProprietesOptiquesConiques } from "./moteur6e/typesProprietesOptiquesConiques";
import { DEFINITION_6GEN63, attentesProprietesOptiquesConiques } from "./moteur6e/verificationProprietesOptiquesConiques";
import { FORMAT_6GEN63, figure6gen63 } from "./ui6e/formatProprietesOptiquesConiques";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen63` — Propriétés optiques des coniques (6e ch. 10, § 6, processus 3 TRANSFÉRER ; audit, lots B et
 * C). Socle commun du 6e ch. 7 (`AppCombinatoire`). Ellipse, hyperbole et parabole ; propriété en choix
 * fermé à une tentative parmi quatre. Figure : le miroir, puis les foyers et le rayon incident, le point
 * d'impact, et le rayon réfléchi (demi-droite, prolongement pointillé vers F′ pour l'hyperbole) APRÈS
 * la réponse.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceProprietesOptiquesConiques, PhaseProprietesOptiquesConiques> = {
  id: "6gen63",
  titre: "Propriétés optiques des coniques",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceProprietesOptiquesConiques,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN63,
  attentes: attentesProprietesOptiquesConiques,
  recapSepare: true,
  format: FORMAT_6GEN63,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen63(e, closes)} />,
};

export function App6gen63() {
  return <AppCombinatoire config={CONFIG} />;
}
