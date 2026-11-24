import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceOptimisationDistance } from "./core5e/optimisationDistance";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceOptimisationDistance } from "./generateurs5e/optimisationDistance";
import { DEFINITION_OPTIMISATION_DISTANCE } from "./ui5e/definitionOptimisationDistance";
import type { PhaseOptimisationDistance } from "./ui5e/formatOptimisationDistance";

/**
 * `5gen71` — « Optimisation : distance et temps minimaux » (5e ch. 5, § 8, processus 3 TRANSFÉRER).
 * Point d'une courbe le plus proche d'un point (on minimise AM²), sauveteur (course puis nage),
 * câble passant par la rive. Cinq écrans : modèle, dérivée, zéro, signe sur le domaine réaliste
 * (choix fermé, une tentative), optimum. `?code=` : mêmes fonctions que
 * `generateurs5e/optimisationDistance/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceOptimisationDistance, PhaseOptimisationDistance> = {
  id: "5gen71",
  titre: "Optimisation : distance et temps minimaux",
  definition: DEFINITION_OPTIMISATION_DISTANCE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceOptimisationDistance,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen71() {
  return <AppEcransTrigo config={CONFIG} />;
}
