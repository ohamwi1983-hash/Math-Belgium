import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDetectiveFonctions } from "./core5e/detectiveFonctions.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveFonctions } from "./generateurs5e/detectiveFonctions";
import { DEFINITION_DETECTIVE_FONCTIONS } from "./ui5e/definitionDetectiveFonctions";
import type { PhaseDetectiveFonctions } from "./ui5e/formatDetectiveFonctions";

/**
 * `5gen58` — « Détective d'erreurs : fonctions et composées » (5e ch. 1, §§ 1–4, processus 3
 * TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix fermé), l'erreur
 * (4 descriptions, choix fermé), la correction (domaine, expression de la composée ou valeur ;
 * 3 tentatives). `?code=` : mêmes fonctions que `generateurs5e/detectiveFonctions/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveFonctions, PhaseDetectiveFonctions> = {
  id: "5gen58",
  titre: "Détective d'erreurs : fonctions et composées",
  definition: DEFINITION_DETECTIVE_FONCTIONS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveFonctions,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 1 — Fonctions : rappels et compléments",
};

export function App5gen58() {
  return <AppEcransTrigo config={CONFIG} />;
}
