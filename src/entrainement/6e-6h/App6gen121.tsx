import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExercicePL, PhasePL } from "./core6e/poissonInverse";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePL } from "./generateurs6e/poissonInverse";
import { DEFINITION_PL } from "./ui6e/formatPoissonInverse";

/**
 * `6gen121` — « Poisson : λ inconnu, valeur la plus probable, seuil d'alerte » (6e ch. 8, § 8, processus 3
 * TRANSFÉRER). `?code=` : mêmes fonctions que `generateurs6e/poissonInverse/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExercicePL, PhasePL> = {
  id: "6gen121",
  titre: "Poisson : λ inconnu, valeur la plus probable, seuil d'alerte",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_PL,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePL,
  genererVariante: construireAvecVariante,
};

export function App6gen121() {
  return <AppEcransTrigo config={CONFIG} />;
}
