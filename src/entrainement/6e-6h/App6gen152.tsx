import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceDetectiveCyclo } from "./core6e/detectiveCyclometriques.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveCyclo } from "./generateurs6e/detectiveCyclometriques";
import { DEFINITION_DETECTIVE_CYCLO } from "./ui6e/definitionDetectiveCyclometriques";
import type { PhaseDetectiveCyclo } from "./ui6e/formatDetectiveCyclometriques";

/**
 * `6gen152` — « Le détective d'erreurs : réciproques et arcfonctions » (6e ch. 1, § 1 à 5, processus 3
 * TRANSFÉRER), même mécanique que 6gen88 / 6gen144 : la copie d'un élève fictif contient une ligne
 * fausse. Écrans : ligne (choix, une tentative), erreur (quatre descriptions, une tentative),
 * correction (valeurs exactes, trois tentatives). `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveCyclo, PhaseDetectiveCyclo> = {
  id: "6gen152",
  titre: "Le détective d'erreurs : réciproques et arcfonctions",
  definition: DEFINITION_DETECTIVE_CYCLO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveCyclo,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
};

export function App6gen152() {
  return <AppEcransExp config={CONFIG} />;
}
