import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDetectiveStat } from "./core5e/detectiveStatistique";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveStat } from "./generateurs5e/detectiveStatistique";
import { DEFINITION_DETECTIVE_STATISTIQUE } from "./ui5e/definitionDetectiveStatistique";
import type { PhaseDetectiveStat } from "./ui5e/formatDetectiveStatistique";

/**
 * `5gen81` — « Détective d'erreurs : statistique à deux variables » (5e ch. 6, fin du chapitre,
 * processus 3 TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix
 * fermé), l'erreur (4 descriptions, choix fermé), la correction (droite, point moyen ou r : 3
 * tentatives ; conclusion : choix fermé). `?code=` : mêmes fonctions que
 * `generateurs5e/detectiveStatistique/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveStat, PhaseDetectiveStat> = {
  id: "5gen81",
  titre: "Détective d'erreurs : statistique à deux variables",
  definition: DEFINITION_DETECTIVE_STATISTIQUE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveStat,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen81() {
  return <AppEcransTrigo config={CONFIG} />;
}
