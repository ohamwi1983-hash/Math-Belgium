import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice101, Phase101 } from "./core6e/equationsCombinatoires";
import { CATALOGUE_101, construireAvecVariante101, genererExercice101 } from "./generateurs6e/equationsCombinatoires";
import { DEFINITION_101 } from "./ui6e/definitionEquationsCombinatoires";

/**
 * `6gen101` — « Factorielles et équations combinatoires » (6e ch. 7, § 1, processus 2 APPLIQUER) :
 * simplifier un quotient de factorielles, résoudre Aₙ² = …, Cₙ² = …, Cₙ² + n = … (racine à
 * rejeter), Cₙᵖ = Cₙ^q par la symétrie. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` :
 * mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<Exercice101, Phase101> = {
  id: "6gen101",
  titre: "Factorielles et équations combinatoires",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_101,
  catalogue: CATALOGUE_101,
  genererLibre: genererExercice101,
  genererVariante: construireAvecVariante101,
};

export function App6gen101() {
  return <AppEcransTrigo config={CONFIG} />;
}
