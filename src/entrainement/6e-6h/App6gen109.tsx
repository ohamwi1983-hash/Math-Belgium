import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceDetectiveCombi } from "./core6e/detectiveCombinatoire";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveCombi } from "./generateurs6e/detectiveCombinatoire";
import { DEFINITION_DETECTIVE_COMBI } from "./ui6e/formatDetectiveCombinatoire";
import type { PhaseDetectiveCombi } from "./ui6e/formatDetectiveCombinatoire";

/**
 * `6gen109` — « Détective d'erreurs : analyse combinatoire » (6e ch. 7, fin du chapitre, processus 3
 * TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix fermé jugé),
 * l'erreur (4 descriptions, choix fermé jugé), la correction (nombre ou probabilité exacte, 3 tentatives).
 * `?code=` : mêmes fonctions que `generateurs6e/detectiveCombinatoire/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveCombi, PhaseDetectiveCombi> = {
  id: "6gen109",
  titre: "Détective d'erreurs : analyse combinatoire",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_DETECTIVE_COMBI,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveCombi,
  genererVariante: construireAvecVariante,
};

export function App6gen109() {
  return <AppEcransTrigo config={CONFIG} />;
}
