import type { ExerciceIntersectionsConiques } from "./core6e/intersectionsConiques.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionsConiques } from "./generateurs6e/intersectionsConiques";
import type { PhaseIntersectionsConiques } from "./moteur6e/typesIntersectionsConiques";
import { pucesMasquees6gen61 } from "./moteur6e/typesIntersectionsConiques";
import { DEFINITION_6GEN61, attentesIntersectionsConiques } from "./moteur6e/verificationIntersectionsConiques";
import { FORMAT_6GEN61, figure6gen61 } from "./ui6e/formatIntersectionsConiques";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { FigureLieux } from "./components6e/FigureLieux";

/**
 * `6gen61` — Intersection d'une conique et d'une droite (6e ch. 10, § 4, processus 2 APPLIQUER ; audit,
 * lots B et C). Socle commun du 6e ch. 7 (`AppCombinatoire`). Le nombre de points communs est un choix
 * fermé (une tentative), tiré à parts égales ; cinq puces tant qu'il n'est pas jugé. Figure : la conique
 * après son équation, la droite APRÈS le nombre de points communs, puis les points trouvés.
 */
const CONFIG: ConfigAppCombinatoire<ExerciceIntersectionsConiques, PhaseIntersectionsConiques> = {
  id: "6gen61",
  titre: "Intersection d'une conique et d'une droite",
  sousTitre: "Chapitre 10 — Les coniques",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceIntersectionsConiques,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN61,
  attentes: attentesIntersectionsConiques,
  recapSepare: true,
  format: FORMAT_6GEN61,
  complement: (e, _p, closes) => <FigureLieux svg={figure6gen61(e, closes)} />,
  pucesMasquees: pucesMasquees6gen61,
};

export function App6gen61() {
  return <AppCombinatoire config={CONFIG} />;
}
