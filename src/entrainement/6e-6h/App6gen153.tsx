import { AppEcransExp } from "./components6e/AppEcransExp";
import type { ConfigAppEcrans } from "./components6e/AppEcransExp";
import type { ExerciceIdentites } from "./core6e/identitesCyclometriques.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIdentites } from "./generateurs6e/identitesCyclometriques";
import { DEFINITION_IDENTITES } from "./ui6e/definitionIdentitesCyclometriques";
import type { PhaseIdentites } from "./ui6e/formatIdentitesCyclometriques";

/**
 * `6gen153` — « Identités trig∘arc et arc∘trig » (6e ch. 1, § 2, processus 2 APPLIQUER). Écrans :
 * verdict (θ dans l'image / signe / domaine : choix fermé, une tentative), puis valeur exacte ou
 * forme en x (champ, trois tentatives). `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceIdentites, PhaseIdentites> = {
  id: "6gen153",
  titre: "Identités trig∘arc et arc∘trig",
  definition: DEFINITION_IDENTITES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceIdentites,
  genererVariante: construireAvecVariante,
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
};

export function App6gen153() {
  return <AppEcransExp config={CONFIG} />;
}
