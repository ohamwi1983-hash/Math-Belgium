import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceDetectiveExp } from "./core6e/detectiveExponentielles.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveExp } from "./generateurs6e/detectiveExponentielles";
import { DEFINITION_DETECTIVE_EXP } from "./ui6e/definitionDetectiveExponentielles";
import type { PhaseDetectiveExp } from "./ui6e/formatDetectiveExponentielles";

/**
 * `6gen144` — « Le détective d'erreurs : exponentielles » (6e ch. 2, § 1 à 7, processus 3
 * TRANSFÉRER), même mécanique que 6gen88 : la copie d'un élève fictif contient une ligne fausse.
 * Écrans : ligne (choix, une tentative), erreur (quatre descriptions, une tentative), correction
 * (valeurs exactes, trois tentatives). `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceDetectiveExp, PhaseDetectiveExp> = {
  id: "6gen144",
  titre: "Le détective d'erreurs : exponentielles",
  definition: DEFINITION_DETECTIVE_EXP,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDetectiveExp,
  genererVariante: construireAvecVariante,
};

export function App6gen144() {
  return <AppEcransExp config={CONFIG} />;
}
