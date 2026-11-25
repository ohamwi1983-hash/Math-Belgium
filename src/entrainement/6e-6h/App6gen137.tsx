import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice137, Phase137 } from "./core6e/hyperboleEquilatere";
import { CATALOGUE_137, construireAvecVariante137, genererExercice137 } from "./generateurs6e/hyperboleEquilatere";
import { DEFINITION_137 } from "./ui6e/definitionHyperboleEquilatere";

/**
 * `6gen137` — « Hyperbole équilatère et xy = k » (6e ch. 10, § 1, processus 2 APPLIQUER). Socle d'écrans
 * partagé (`AppEcransTrigo`, sans modification) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice137, Phase137> = {
  id: "6gen137",
  titre: "Hyperbole équilatère et xy = k",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_137,
  catalogue: CATALOGUE_137,
  genererLibre: genererExercice137,
  genererVariante: construireAvecVariante137,
  largeurFigure: 300,
  figureToujoursVisible: true,
};

export function App6gen137() {
  return <AppEcransTrigo config={CONFIG} />;
}
