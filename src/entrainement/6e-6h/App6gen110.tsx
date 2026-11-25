import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice110, Phase110 } from "./core6e/varianceLoiDiscrete";
import { CATALOGUE_110, construireAvecVariante110, genererExercice110 } from "./generateurs6e/varianceLoiDiscrete";
import { DEFINITION_110 } from "./ui6e/definitionVarianceLoiDiscrete";

/**
 * `6gen110` — « Variance et écart-type d'une loi discrète » (6e ch. 8, § 1, processus 2 APPLIQUER) :
 * E(X), E(X²), V(X) par la formule de König, σ(X) ; ou deux jeux de même espérance, lequel est le plus
 * risqué ? Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice110, Phase110> = {
  id: "6gen110",
  titre: "Variance et écart-type d'une loi discrète",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_110,
  catalogue: CATALOGUE_110,
  genererLibre: genererExercice110,
  genererVariante: construireAvecVariante110,
};

export function App6gen110() {
  return <AppEcransTrigo config={CONFIG} />;
}
