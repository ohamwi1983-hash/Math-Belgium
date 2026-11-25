import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceDC, PhaseDC } from "./core6e/detectiveConiques";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDC } from "./generateurs6e/detectiveConiques";
import { DEFINITION_DC } from "./ui6e/formatDetectiveConiques";

/**
 * `6gen143` — « Détective d'erreurs : coniques » (6e ch. 10, fin du chapitre, processus 3
 * TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix jugé), l'erreur
 * (4 descriptions, choix jugé), la correction (3 tentatives).
 * `?code=` : mêmes fonctions que `generateurs6e/detectiveConiques/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDC, PhaseDC> = {
  id: "6gen143",
  titre: "Détective d'erreurs : coniques",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_DC,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDC,
  genererVariante: construireAvecVariante,
};

export function App6gen143() {
  return <AppEcransTrigo config={CONFIG} />;
}
