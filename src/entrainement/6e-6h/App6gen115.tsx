import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice115, Phase115 } from "./core6e/loiUniformeContinue";
import { CATALOGUE_115, construireAvecVariante115, genererExercice115 } from "./generateurs6e/loiUniformeContinue";
import { DEFINITION_115 } from "./ui6e/definitionLoiUniformeContinue";

/**
 * `6gen115` — « Loi uniforme continue » (6e ch. 8, § 5, processus 2 APPLIQUER) : densité, probabilité
 * (y compris un intervalle qui déborde), E, V, σ ; ou retrouver a et b à partir de E et V. Socle
 * d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice115, Phase115> = {
  id: "6gen115",
  titre: "Loi uniforme continue",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_115,
  catalogue: CATALOGUE_115,
  genererLibre: genererExercice115,
  genererVariante: construireAvecVariante115,
};

export function App6gen115() {
  return <AppEcransTrigo config={CONFIG} />;
}
