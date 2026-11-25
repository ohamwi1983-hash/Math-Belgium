import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import { BoutonTablePhi } from "../components/BoutonTablePhi";
import type { ExerciceCM, PhaseCM } from "./core6e/choisirModele";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCM } from "./generateurs6e/choisirModele";
import { DEFINITION_CM } from "./ui6e/formatChoisirModele";

/**
 * `6gen119` — « Choisir le modèle » (6e ch. 8, fin du chapitre, processus 3 TRANSFÉRER). Modèle parmi six
 * (choix jugé, une tentative), paramètres ou raison, probabilité. La table de Φ est consultable dans
 * TOUS les exercices (elle ne doit pas trahir la loi normale).
 * `?code=` : mêmes fonctions que `generateurs6e/choisirModele/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCM, PhaseCM> = {
  id: "6gen119",
  titre: "Choisir le modèle",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_CM,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCM,
  genererVariante: construireAvecVariante,
};

export function App6gen119() {
  return (
    <>
      <AppEcransTrigo config={CONFIG} />
      <BoutonTablePhi />
    </>
  );
}
