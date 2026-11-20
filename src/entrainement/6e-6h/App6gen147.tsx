import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceModeleTableau } from "./core6e/modeleTableau.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceModeleTableau } from "./generateurs6e/modeleTableau";
import { DEFINITION_MODELE_TABLEAU } from "./ui6e/definitionModeleTableau";
import type { PhaseModeleTableau } from "./ui6e/formatModeleTableau";

/**
 * `6gen147` — « Modèle exponentiel lu dans un tableau » (6e ch. 2, § 7, processus 2 APPLIQUER).
 * Quatre mesures à intervalles égaux : rapports successifs, verdict exponentiel / linéaire (choix
 * fermé, une tentative, tiré 50/50), paramètres exacts (b et a, ou p et m), prévision arrondie.
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceModeleTableau, PhaseModeleTableau> = {
  id: "6gen147",
  titre: "Modèle exponentiel lu dans un tableau",
  definition: DEFINITION_MODELE_TABLEAU,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceModeleTableau,
  genererVariante: construireAvecVariante,
};

export function App6gen147() {
  return <AppEcransExp config={CONFIG} />;
}
