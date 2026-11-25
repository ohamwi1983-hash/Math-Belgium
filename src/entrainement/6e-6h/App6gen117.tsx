import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceCG, PhaseCG } from "./core6e/courbeGauss";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCG } from "./generateurs6e/courbeGauss";
import { DEFINITION_CG } from "./ui6e/formatCourbeGauss";

/**
 * `6gen117` — « Courbe de Gauss : aires et règle empirique » (6e ch. 8, § 6, processus 1 CONNAÎTRE).
 * Aire colorée ↔ probabilité ↔ écriture avec Φ ; règle empirique 68,3 / 95,4 / 99,7 % et « un seul côté ».
 * `?code=` : mêmes fonctions que `generateurs6e/courbeGauss/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCG, PhaseCG> = {
  id: "6gen117",
  titre: "Courbe de Gauss : aires et règle empirique",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_CG,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCG,
  genererVariante: construireAvecVariante,
  figureToujoursVisible: true,
};

export function App6gen117() {
  return <AppEcransTrigo config={CONFIG} />;
}
