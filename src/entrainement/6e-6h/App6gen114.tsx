import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice114, Phase114 } from "./core6e/discreteOuContinue";
import { CATALOGUE_114, construireAvecVariante114, genererExercice114 } from "./generateurs6e/discreteOuContinue";
import { DEFINITION_114 } from "./ui6e/definitionDiscreteOuContinue";

/**
 * `6gen114` — « Discrète ou continue ? » (6e ch. 8, § 4, processus 1 CONNAÎTRE) : nature de la
 * variable (verdict équilibré), ensemble des valeurs, outil de calcul (somme ou intégrale, P(X = c)) —
 * trois choix fermés à une tentative. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes
 * fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice114, Phase114> = {
  id: "6gen114",
  titre: "Discrète ou continue ?",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_114,
  catalogue: CATALOGUE_114,
  genererLibre: genererExercice114,
  genererVariante: construireAvecVariante114,
};

export function App6gen114() {
  return <AppEcransTrigo config={CONFIG} />;
}
