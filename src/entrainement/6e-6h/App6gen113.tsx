import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice113, Phase113 } from "./core6e/densiteProbabilite";
import { CATALOGUE_113, construireAvecVariante113, genererExercice113 } from "./generateurs6e/densiteProbabilite";
import { DEFINITION_113 } from "./ui6e/definitionDensiteProbabilite";

/**
 * `6gen113` — « Densité de probabilité » (6e ch. 8, § 3, processus 2 APPLIQUER) : trouver k pour que
 * l'aire totale vaille 1, puis des probabilités comme aires (densité tracée) ou par une primitive et
 * l'espérance (densité donnée par une formule). Socle d'écrans partagé (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice113, Phase113> = {
  id: "6gen113",
  titre: "Densité de probabilité",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_113,
  catalogue: CATALOGUE_113,
  genererLibre: genererExercice113,
  genererVariante: construireAvecVariante113,
  largeurFigure: 360,
  figureToujoursVisible: true,
};

export function App6gen113() {
  return <AppEcransTrigo config={CONFIG} />;
}
