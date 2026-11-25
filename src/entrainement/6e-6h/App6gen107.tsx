import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceTI, PhaseTI } from "./core6e/termeIndependant";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTI } from "./generateurs6e/termeIndependant";
import { DEFINITION_TI } from "./ui6e/formatTermeIndependant";

/**
 * `6gen107` — « Terme indépendant » (6e ch. 7, § 3, processus 2 APPLIQUER). Exposant de x dans le
 * terme général, valeur de k (ou « aucun »), terme indépendant (0 s'il n'existe pas).
 * `?code=` : mêmes fonctions que `generateurs6e/termeIndependant/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTI, PhaseTI> = {
  id: "6gen107",
  titre: "Terme indépendant",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_TI,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTI,
  genererVariante: construireAvecVariante,
};

export function App6gen107() {
  return <AppEcransTrigo config={CONFIG} />;
}
