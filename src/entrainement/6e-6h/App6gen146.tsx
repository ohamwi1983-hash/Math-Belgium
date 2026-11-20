import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExercicePuissances } from "./core6e/puissancesSansCalculatrice.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePuissances } from "./generateurs6e/puissancesSansCalculatrice";
import { DEFINITION_PUISSANCES } from "./ui6e/definitionPuissancesSansCalculatrice";
import type { PhasePuissances } from "./ui6e/formatPuissancesSansCalculatrice";

/**
 * `6gen146` — « Puissances à exposant réel : calculer et comparer sans calculatrice » (6e ch. 2,
 * § 1, processus 1 CONNAÎTRE). Simplifier (règles (1), (2), (4), base a² réécrite) puis valeur
 * exacte ; comparer a^u et a^v (ordre des exposants, sens de variation, conclusion : trois choix
 * fermés à une tentative) ; bases 1/a, 0,5, a^j écrites comme une puissance de a, puis valeur en x₀.
 * Puissances exactes uniquement (décision de l'utilisateur : pas de logarithme au ch. 2).
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExercicePuissances, PhasePuissances> = {
  id: "6gen146",
  titre: "Puissances à exposant réel sans calculatrice",
  definition: DEFINITION_PUISSANCES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePuissances,
  genererVariante: construireAvecVariante,
};

export function App6gen146() {
  return <AppEcransExp config={CONFIG} />;
}
