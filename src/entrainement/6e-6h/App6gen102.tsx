import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice102, Phase102 } from "./core6e/trianglePascal";
import { CATALOGUE_102, construireAvecVariante102, genererExercice102 } from "./generateurs6e/trianglePascal";
import { DEFINITION_102 } from "./ui6e/definitionTrianglePascal";

/**
 * `6gen102` — « Triangle de Pascal et propriétés de Cₙᵏ » (6e ch. 7, § 3, processus 1 CONNAÎTRE) :
 * compléter une ligne, symétrie et relation de Pascal sur des valeurs données, nombre de parties
 * (2ⁿ, 2ⁿ − 1…), identité vraie ou fausse (verdict équilibré). Socle d'écrans partagé
 * (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<Exercice102, Phase102> = {
  id: "6gen102",
  titre: "Triangle de Pascal et propriétés",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_102,
  catalogue: CATALOGUE_102,
  genererLibre: genererExercice102,
  genererVariante: construireAvecVariante102,
  largeurFigure: 420,
};

export function App6gen102() {
  return <AppEcransTrigo config={CONFIG} />;
}
