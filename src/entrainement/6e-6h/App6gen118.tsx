import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import { BoutonTablePhi } from "../components/BoutonTablePhi";
import type { ExerciceAN, PhaseAN } from "./core6e/approximationNormale";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAN } from "./generateurs6e/approximationNormale";
import { DEFINITION_AN } from "./ui6e/formatApproximationNormale";

/**
 * `6gen118` — « Approximation normale avec correction de continuité » (6e ch. 8, § 7, processus 2
 * APPLIQUER). Verdict « approximable ? » (choix jugé, une tentative), puis μ et σ, bornes corrigées, z,
 * probabilité — ou condition en défaut et loi binomiale exacte. Cinq puces dans les deux cas (le nombre
 * d'écrans ne trahit pas le verdict). Table de Φ consultable.
 * `?code=` : mêmes fonctions que `generateurs6e/approximationNormale/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceAN, PhaseAN> = {
  id: "6gen118",
  titre: "Approximation normale avec correction de continuité",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_AN,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceAN,
  genererVariante: construireAvecVariante,
  nombrePuces: 5,
};

export function App6gen118() {
  return (
    <>
      <AppEcransTrigo config={CONFIG} />
      <BoutonTablePhi />
    </>
  );
}
