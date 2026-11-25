import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice132, Phase132 } from "./core6e/lireConique";
import { CATALOGUE_132, construireAvecVariante132, genererExercice132 } from "./generateurs6e/lireConique";
import { DEFINITION_132 } from "./ui6e/definitionLireConique";

/**
 * `6gen132` — « Lire une conique sur sa figure ou son équation réduite » (6e ch. 10, § 1–2 et § 6,
 * processus 1 CONNAÎTRE). Socle d'écrans partagé (`AppEcransTrigo`, sans modification) ; `?code=` :
 * mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice132, Phase132> = {
  id: "6gen132",
  titre: "Lire une conique sur sa figure ou son équation réduite",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_132,
  catalogue: CATALOGUE_132,
  genererLibre: genererExercice132,
  genererVariante: construireAvecVariante132,
  largeurFigure: 320,
  figureToujoursVisible: true,
};

export function App6gen132() {
  return <AppEcransTrigo config={CONFIG} />;
}
