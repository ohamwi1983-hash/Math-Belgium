import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice134, Phase134 } from "./core6e/reduireConique";
import { CATALOGUE_134, construireAvecVariante134, genererExercice134 } from "./generateurs6e/reduireConique";
import { DEFINITION_134 } from "./ui6e/definitionReduireConique";

/**
 * `6gen134` — « Réduire par translation et donner tous les éléments » (6e ch. 10, § 2, processus 2
 * APPLIQUER). Socle d'écrans partagé (`AppEcransTrigo`, sans modification) ; six écrans pour chaque
 * nature ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice134, Phase134> = {
  id: "6gen134",
  titre: "Réduire par translation et donner tous les éléments",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_134,
  catalogue: CATALOGUE_134,
  genererLibre: genererExercice134,
  genererVariante: construireAvecVariante134,
};

export function App6gen134() {
  return <AppEcransTrigo config={CONFIG} />;
}
