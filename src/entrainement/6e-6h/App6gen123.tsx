import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice123, Phase123 } from "./core6e/demontrerAnalytique";
import { CATALOGUE_123, construireAvecVariante123, genererExercice123 } from "./generateurs6e/demontrerAnalytique";
import { DEFINITION_123 } from "./ui6e/definitionDemontrerAnalytique";

/**
 * `6gen123` — « Démontrer par la géométrie analytique » (6e ch. 9, § 3, processus 3 TRANSFÉRER) :
 * repère qui ne perd pas la généralité, coordonnées en lettres, égalité à établir, calcul (médianes,
 * parallélogramme, Varignon, médiane du triangle rectangle, losange). Socle d'écrans partagé
 * (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice123, Phase123> = {
  id: "6gen123",
  titre: "Démontrer par la géométrie analytique",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_123,
  catalogue: CATALOGUE_123,
  genererLibre: genererExercice123,
  genererVariante: construireAvecVariante123,
  largeurFigure: 300,
  figureToujoursVisible: true,
};

export function App6gen123() {
  return <AppEcransTrigo config={CONFIG} />;
}
