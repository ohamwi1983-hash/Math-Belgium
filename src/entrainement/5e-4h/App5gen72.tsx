import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDetectiveDerivees } from "./core5e/detectiveDerivees.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveDerivees } from "./generateurs5e/detectiveDerivees";
import { DEFINITION_DETECTIVE_DERIVEES } from "./ui5e/definitionDetectiveDerivees";
import type { PhaseDetectiveDerivees } from "./ui5e/formatDetectiveDerivees";

/**
 * `5gen72` — « Détective d'erreurs : dérivées » (5e ch. 5, §§ 2, 3, 5, processus 3 TRANSFÉRER).
 * Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix fermé), l'erreur (4
 * descriptions, choix fermé), la correction (tangente ou abscisses des extremums ; 3 tentatives).
 * `?code=` : mêmes fonctions que `generateurs5e/detectiveDerivees/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveDerivees, PhaseDetectiveDerivees> = {
  id: "5gen72",
  titre: "Détective d'erreurs : dérivées",
  definition: DEFINITION_DETECTIVE_DERIVEES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveDerivees,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen72() {
  return <AppEcransTrigo config={CONFIG} />;
}
