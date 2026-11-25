import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice100, Phase100 } from "./core6e/quelleFormule";
import { CATALOGUE_100, construireAvecVariante100, genererExercice100 } from "./generateurs6e/quelleFormule";
import { DEFINITION_100 } from "./ui6e/definitionQuelleFormule";

/**
 * `6gen100` — « Quelle formule ? Reconnaître le groupement » (6e ch. 7, § 1, processus 2 APPLIQUER) :
 * l'ordre compte-t-il ? répétition ? tous utilisés ? puis le type (sept lignes du tableau) et le
 * calcul. Type tiré à parts égales. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes
 * fonctions que l'adaptateur papier ; cinq puces (la question 3 est sautée sans ordre).
 */
const CONFIG: ConfigAppEcrans<Exercice100, Phase100> = {
  id: "6gen100",
  titre: "Quelle formule ? Reconnaître le groupement",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_100,
  catalogue: CATALOGUE_100,
  genererLibre: genererExercice100,
  genererVariante: construireAvecVariante100,
  nombrePuces: 5,
};

export function App6gen100() {
  return <AppEcransTrigo config={CONFIG} />;
}
