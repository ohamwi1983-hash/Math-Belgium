import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceGrapheReciproque } from "./core6e/grapheReciproque.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceGrapheReciproque } from "./generateurs6e/grapheReciproque";
import { DEFINITION_GRAPHE_RECIPROQUE } from "./ui6e/definitionGrapheReciproque";
import type { PhaseGrapheReciproque } from "./ui6e/formatGrapheReciproque";

/**
 * `6gen154` — « Graphe de la réciproque » (6e ch. 1, § 1, processus 2 APPLIQUER). Écrans : point A′,
 * domaine et image de f⁻¹, graphe de f⁻¹ parmi quatre (choix fermé, une tentative), pentes des
 * tangentes en A et en A′. Figure : quadrillage d'une unité, même échelle en x et en y.
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceGrapheReciproque, PhaseGrapheReciproque> = {
  id: "6gen154",
  titre: "Graphe de la réciproque",
  definition: DEFINITION_GRAPHE_RECIPROQUE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceGrapheReciproque,
  genererVariante: construireAvecVariante,
  largeurFigure: 380,
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
};

export function App6gen154() {
  return <AppEcransExp config={CONFIG} />;
}
