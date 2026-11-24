import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceApproximationAffine } from "./core5e/approximationAffine";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceApproximationAffine } from "./generateurs5e/approximationAffine";
import { DEFINITION_APPROXIMATION_AFFINE } from "./ui5e/definitionApproximationAffine";
import type { PhaseApproximationAffine } from "./ui5e/formatApproximationAffine";

/**
 * `5gen68` — « Approximation affine » (5e ch. 5, § 2, processus 2 APPLIQUER) : f(a + h) ≈ f(a) +
 * f′(a)·h — choix de a et h, f′(x), f(a) et f′(a), approximation, erreur commise. Socle
 * `AppEcransTrigo` ; `?code=` : mêmes fonctions que `generateurs5e/approximationAffine/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceApproximationAffine, PhaseApproximationAffine> = {
  id: "5gen68",
  titre: "Approximation affine",
  definition: DEFINITION_APPROXIMATION_AFFINE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceApproximationAffine,
  genererVariante: construireAvecVarianteId,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen68() {
  return <AppEcransTrigo config={CONFIG} />;
}
