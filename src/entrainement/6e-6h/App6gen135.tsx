import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice135, Phase135 } from "./core6e/foyerDirectrice";
import { CATALOGUE_135, construireAvecVariante135, genererExercice135 } from "./generateurs6e/foyerDirectrice";
import { DEFINITION_135 } from "./ui6e/definitionFoyerDirectrice";

/**
 * `6gen135` — « Équation depuis foyer, directrice et excentricité » (6e ch. 10, § 2, processus 2
 * APPLIQUER). Socle d'écrans partagé (`AppEcransTrigo`, sans modification) ; `?code=` : mêmes fonctions
 * que l'adaptateur ; figure de l'écran : F et d seulement.
 */
const CONFIG: ConfigAppEcrans<Exercice135, Phase135> = {
  id: "6gen135",
  titre: "Équation depuis foyer, directrice et excentricité",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_135,
  catalogue: CATALOGUE_135,
  genererLibre: genererExercice135,
  genererVariante: construireAvecVariante135,
  largeurFigure: 300,
  figureToujoursVisible: true,
};

export function App6gen135() {
  return <AppEcransTrigo config={CONFIG} />;
}
