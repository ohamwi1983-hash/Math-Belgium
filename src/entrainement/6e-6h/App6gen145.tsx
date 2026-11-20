import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceLimitesRef } from "./core6e/limitesReference.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLimitesRef } from "./generateurs6e/limitesReference";
import { DEFINITION_LIMITES_REF } from "./ui6e/definitionLimitesReference";
import type { PhaseLimitesRef } from "./ui6e/formatLimitesReference";

/**
 * `6gen145` — « Limites de référence et croissances comparées » (6e ch. 2, § 1, processus 2
 * APPLIQUER). Trois écrans : forme (0/0, ∞/∞, 0·∞, ∞ − ∞ ou pas indéterminée) et limite de référence
 * (choix fermés, une tentative), puis valeur exacte (champ, trois tentatives). `?code=` : mêmes
 * fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceLimitesRef, PhaseLimitesRef> = {
  id: "6gen145",
  titre: "Limites de référence et croissances comparées",
  definition: DEFINITION_LIMITES_REF,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLimitesRef,
  genererVariante: construireAvecVariante,
};

export function App6gen145() {
  return <AppEcransExp config={CONFIG} />;
}
