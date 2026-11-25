import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceKE, PhaseKE } from "./core6e/orbitesKepler";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceKE } from "./generateurs6e/orbitesKepler";
import { DEFINITION_KE } from "./ui6e/formatOrbitesKepler";

/**
 * `6gen141` — « Orbites et ellipses : Kepler » (6e ch. 10, § 1 et § 3, processus 3 TRANSFÉRER). Périhélie
 * et aphélie (ou altitudes d'un satellite) : a et c, position du corps central (un foyer), excentricité,
 * demi-petit axe ; schéma de l'orbite, corps central dessiné une fois l'écran 2 passé.
 * `?code=` : mêmes fonctions que `generateurs6e/orbitesKepler/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceKE, PhaseKE> = {
  id: "6gen141",
  titre: "Orbites et ellipses : Kepler",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_KE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceKE,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen141() {
  return <AppEcransTrigo config={CONFIG} />;
}
