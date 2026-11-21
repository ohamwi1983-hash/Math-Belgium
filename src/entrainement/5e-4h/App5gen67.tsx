import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDetectiveLimites } from "./core5e/detectiveLimites.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveLimites } from "./generateurs5e/detectiveLimites";
import { DEFINITION_DETECTIVE_LIMITES } from "./ui5e/definitionDetectiveLimites";
import type { PhaseDetectiveLimites } from "./ui5e/formatDetectiveLimites";

/**
 * `5gen67` — « Détective d'erreurs : limites » (5e ch. 4, §§ 1–5, processus 3 TRANSFÉRER). Copie
 * numérotée d'un élève fictif, une ligne fausse : la ligne (choix fermé), l'erreur (4 descriptions,
 * choix fermé), la correction (limite(s) ou équation d'asymptote ; 3 tentatives). `?code=` : mêmes
 * fonctions que `generateurs5e/detectiveLimites/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveLimites, PhaseDetectiveLimites> = {
  id: "5gen67",
  titre: "Détective d'erreurs : limites",
  definition: DEFINITION_DETECTIVE_LIMITES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveLimites,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 4 — Limites et asymptotes",
};

export function App5gen67() {
  return <AppEcransTrigo config={CONFIG} />;
}
