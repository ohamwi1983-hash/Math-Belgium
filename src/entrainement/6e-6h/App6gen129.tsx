import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceCP, PhaseCP } from "./core6e/courbeParametree";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCP } from "./generateurs6e/courbeParametree";
import { DEFINITION_CP } from "./ui6e/formatCourbeParametree";

/**
 * `6gen129` — « Courbe paramétrée : élimination et restriction » (6e ch. 9, § 6, processus 2
 * APPLIQUER). Technique d'élimination (choix jugé), équation cartésienne, partie décrite (verdict, choix
 * jugé), condition ; courbe tracée dès que l'équation est trouvée. Quatre puces pour tous les verdicts.
 * `?code=` : mêmes fonctions que `generateurs6e/courbeParametree/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceCP, PhaseCP> = {
  id: "6gen129",
  titre: "Courbe paramétrée : élimination et restriction",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_CP,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceCP,
  genererVariante: construireAvecVariante,
  nombrePuces: 4,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen129() {
  return <AppEcransTrigo config={CONFIG} />;
}
