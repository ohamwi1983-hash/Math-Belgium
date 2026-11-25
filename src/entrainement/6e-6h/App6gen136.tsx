import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice136, Phase136 } from "./core6e/rayonsFocaux";
import { CATALOGUE_136, construireAvecVariante136, genererExercice136 } from "./generateurs6e/rayonsFocaux";
import { DEFINITION_136 } from "./ui6e/definitionRayonsFocaux";

/**
 * `6gen136` — « Rayons focaux et triangle focal » (6e ch. 10, § 3, processus 2 APPLIQUER). Socle d'écrans
 * partagé (`AppEcransTrigo`, sans modification) ; trois puces pour la variante `aire` même quand P
 * n'existe pas (la troisième passe « sans objet ») ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice136, Phase136> = {
  id: "6gen136",
  titre: "Rayons focaux et triangle focal",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_136,
  catalogue: CATALOGUE_136,
  genererLibre: genererExercice136,
  genererVariante: construireAvecVariante136,
  largeurFigure: 320,
  nombrePuces: 3,
  figureToujoursVisible: true,
};

export function App6gen136() {
  return <AppEcransTrigo config={CONFIG} />;
}
