import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import { BoutonTablePhi } from "../components/BoutonTablePhi";
import type { ExerciceDVA } from "./core6e/detectiveVariablesAleatoires";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDVA } from "./generateurs6e/detectiveVariablesAleatoires";
import { DEFINITION_DVA } from "./ui6e/formatDetectiveVariablesAleatoires";
import type { PhaseDVA } from "./ui6e/formatDetectiveVariablesAleatoires";

/**
 * `6gen122` — « Détective d'erreurs : variables aléatoires » (6e ch. 8, fin du chapitre, processus 3
 * TRANSFÉRER). Copie numérotée d'un élève fictif, une ligne fausse : la ligne (choix jugé), l'erreur
 * (4 descriptions, choix jugé), la correction (3 tentatives). Table de Φ consultable (toutes copies).
 * `?code=` : mêmes fonctions que `generateurs6e/detectiveVariablesAleatoires/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDVA, PhaseDVA> = {
  id: "6gen122",
  titre: "Détective d'erreurs : variables aléatoires",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_DVA,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDVA,
  genererVariante: construireAvecVariante,
};

export function App6gen122() {
  return (
    <>
      <AppEcransTrigo config={CONFIG} />
      <BoutonTablePhi />
    </>
  );
}
