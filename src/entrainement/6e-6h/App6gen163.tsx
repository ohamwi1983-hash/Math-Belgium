import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceDetectiveProba } from "./core6e/detectiveProbabilites";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveProba } from "./generateurs6e/detectiveProbabilites";
import { DEFINITION_DETECTIVE_PROBA } from "./ui6e/definitionDetectiveProbabilites";
import type { PhaseDetectiveProba } from "./ui6e/formatDetectiveProbabilites";

/**
 * `6gen163` — « Détective d'erreurs : probabilités » (6e ch. 6, §§ 1 à 4, processus 3 TRANSFÉRER).
 * Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix fermé jugé), l'erreur (4
 * descriptions, choix fermé jugé), la correction (probabilité exacte, 3 tentatives).
 * `?code=` : mêmes fonctions que `generateurs6e/detectiveProbabilites/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveProba, PhaseDetectiveProba> = {
  id: "6gen163",
  titre: "Détective d'erreurs : probabilités",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 6 — Les probabilités",
  definition: DEFINITION_DETECTIVE_PROBA,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveProba,
  genererVariante: construireAvecVariante,
};

export function App6gen163() {
  return <AppEcransTrigo config={CONFIG} />;
}
