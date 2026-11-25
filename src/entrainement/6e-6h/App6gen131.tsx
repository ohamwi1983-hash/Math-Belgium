import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceDL, PhaseDL } from "./core6e/detectiveLieux";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDL } from "./generateurs6e/detectiveLieux";
import { DEFINITION_DL } from "./ui6e/formatDetectiveLieux";

/**
 * `6gen131` — « Détective d'erreurs : lieux, droites et cercles » (6e ch. 9, fin du chapitre, processus 3
 * TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix jugé), l'erreur
 * (4 descriptions, choix jugé), la correction (3 tentatives).
 * `?code=` : mêmes fonctions que `generateurs6e/detectiveLieux/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDL, PhaseDL> = {
  id: "6gen131",
  titre: "Détective d'erreurs : lieux, droites et cercles",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_DL,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDL,
  genererVariante: construireAvecVariante,
};

export function App6gen131() {
  return <AppEcransTrigo config={CONFIG} />;
}
