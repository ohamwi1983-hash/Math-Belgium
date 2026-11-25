import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice112, Phase112 } from "./core6e/fonctionRepartition";
import { CATALOGUE_112, construireAvecVariante112, genererExercice112 } from "./generateurs6e/fonctionRepartition";
import { DEFINITION_112 } from "./ui6e/definitionFonctionRepartition";

/**
 * `6gen112` — « Fonction de répartition » (6e ch. 8, § 1 et § 3, processus 2 APPLIQUER) : escalier
 * d'une loi discrète (intervalle, complément) ou fonction continue (laquelle est une fonction de
 * répartition ? probabilités, f = F′). Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes
 * fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice112, Phase112> = {
  id: "6gen112",
  titre: "Fonction de répartition",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_112,
  catalogue: CATALOGUE_112,
  genererLibre: genererExercice112,
  genererVariante: construireAvecVariante112,
};

export function App6gen112() {
  return <AppEcransTrigo config={CONFIG} />;
}
