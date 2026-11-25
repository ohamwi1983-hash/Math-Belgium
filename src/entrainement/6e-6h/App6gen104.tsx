import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice104, Phase104 } from "./core6e/etoilesBarres";
import { CATALOGUE_104, construireAvecVariante104, genererExercice104 } from "./generateurs6e/etoilesBarres";
import { DEFINITION_104 } from "./ui6e/definitionEtoilesBarres";

/**
 * `6gen104` — « Étoiles et barres » (6e ch. 7, § 1, processus 2 APPLIQUER) : boules de glace,
 * bonbons dans des boîtes, solutions entières de x₁ + … + xₙ = p, au moins un par boîte. Socle
 * d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<Exercice104, Phase104> = {
  id: "6gen104",
  titre: "Étoiles et barres",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_104,
  catalogue: CATALOGUE_104,
  genererLibre: genererExercice104,
  genererVariante: construireAvecVariante104,
};

export function App6gen104() {
  return <AppEcransTrigo config={CONFIG} />;
}
