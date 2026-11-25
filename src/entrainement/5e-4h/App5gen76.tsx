import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceLireNuage } from "./core5e/lireNuage";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireNuage } from "./generateurs5e/lireNuage";
import { DEFINITION_LIRE_NUAGE } from "./ui5e/definitionLireNuage";
import type { PhaseLireNuage } from "./ui5e/formatLireNuage";

/**
 * `5gen76` — « Lire un nuage de points » (5e ch. 6, § 1–2, processus 1 CONNAÎTRE) : forme et sens d'un
 * nuage, sens et intensité d'une corrélation, quatre nuages à associer à leur r. Socle `AppEcransTrigo` ;
 * `?code=` : mêmes fonctions que `generateurs5e/lireNuage/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLireNuage, PhaseLireNuage> = {
  id: "5gen76",
  titre: "Lire un nuage de points",
  definition: DEFINITION_LIRE_NUAGE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLireNuage,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 360,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
  figureToujoursVisible: true,
};

export function App5gen76() {
  return <AppEcransTrigo config={CONFIG} />;
}
