import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice103, Phase103 } from "./core6e/anagrammesContraintes";
import { CATALOGUE_103, construireAvecVariante103, genererExercice103 } from "./generateurs6e/anagrammesContraintes";
import { DEFINITION_103 } from "./ui6e/definitionAnagrammesContraintes";

/**
 * `6gen103` — « Anagrammes et contraintes » (6e ch. 7, § 2, processus 2 APPLIQUER) : mots réels à
 * lettres répétées ; anagrammes (− 1), commence par…, voyelles groupées, jamais côte à côte.
 * Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<Exercice103, Phase103> = {
  id: "6gen103",
  titre: "Anagrammes et contraintes",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_103,
  catalogue: CATALOGUE_103,
  genererLibre: genererExercice103,
  genererVariante: construireAvecVariante103,
};

export function App6gen103() {
  return <AppEcransTrigo config={CONFIG} />;
}
