import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice124, Phase124 } from "./core6e/pointsRemarquablesEuler";
import { CATALOGUE_124, construireAvecVariante124, genererExercice124 } from "./generateurs6e/pointsRemarquablesEuler";
import { DEFINITION_124 } from "./ui6e/definitionPointsRemarquablesEuler";

/**
 * `6gen124` — « Points remarquables et droite d'Euler » (6e ch. 9, § 1, processus 2 APPLIQUER) :
 * G, médiatrice de [AB], O, hauteur issue de C, H et le centre N du cercle des neuf points d'un
 * triangle à sommets entiers. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions
 * que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice124, Phase124> = {
  id: "6gen124",
  titre: "Points remarquables et droite d'Euler",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_124,
  catalogue: CATALOGUE_124,
  genererLibre: genererExercice124,
  genererVariante: construireAvecVariante124,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen124() {
  return <AppEcransTrigo config={CONFIG} />;
}
