import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceLO, PhaseLO } from "./core6e/hyperboleLoran";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLO } from "./generateurs6e/hyperboleLoran";
import { DEFINITION_LO } from "./ui6e/formatHyperboleLoran";

/**
 * `6gen142` — « Hyperbole de navigation : LORAN » (6e ch. 10, § 6, processus 3 TRANSFÉRER). Différence des
 * distances (vitesse × retard), branche (choix jugé, émetteur reçu en premier tiré avant les nombres),
 * équation de l'hyperbole, position(s) du navire sur sa route (une, ou deux : ambiguïté).
 * `?code=` : mêmes fonctions que `generateurs6e/hyperboleLoran/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLO, PhaseLO> = {
  id: "6gen142",
  titre: "Hyperbole de navigation : LORAN",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_LO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLO,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen142() {
  return <AppEcransTrigo config={CONFIG} />;
}
