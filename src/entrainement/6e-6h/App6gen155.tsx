import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceDeriveeReciproque } from "./core6e/deriveeReciproquePoint.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceReciproque } from "./generateurs6e/deriveeReciproquePoint";
import { DEFINITION_RECIPROQUE } from "./ui6e/definitionDeriveeReciproquePoint";
import type { PhaseReciproque } from "./ui6e/formatDeriveeReciproquePoint";

/**
 * `6gen155` — « Dérivée d'une réciproque en un point » (6e ch. 1, § 1, processus 2 APPLIQUER).
 * Écrans : x₀ = f⁻¹(y₀), f′(x₀), le théorème s'applique-t-il ? (choix fermé, une tentative),
 * (f⁻¹)′(y₀). Quatre puces fixes : quand f′(x₀) = 0, la quatrième passe « sans objet » à la fin.
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceDeriveeReciproque, PhaseReciproque> = {
  id: "6gen155",
  titre: "Dérivée d'une réciproque en un point",
  definition: DEFINITION_RECIPROQUE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceReciproque,
  genererVariante: construireAvecVariante,
  nombrePuces: 4,
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
};

export function App6gen155() {
  return <AppEcransExp config={CONFIG} />;
}
