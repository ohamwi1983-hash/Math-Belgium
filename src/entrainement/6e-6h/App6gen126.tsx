import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { Exercice126, Phase126 } from "./core6e/tangentesPositionCercle";
import { CATALOGUE_126, construireAvecVariante126, genererExercice126 } from "./generateurs6e/tangentesPositionCercle";
import { DEFINITION_126 } from "./ui6e/definitionTangentesPositionCercle";

/**
 * `6gen126` — « Tangentes et position relative droite–cercle » (6e ch. 9, § 2, processus 2 APPLIQUER) :
 * position d'une droite (distance au centre, verdict au tiers), tangente en un point, tangentes issues
 * d'un point extérieur (verticale comprise) et longueur PT. Socle d'écrans partagé (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<Exercice126, Phase126> = {
  id: "6gen126",
  titre: "Tangentes et position relative droite–cercle",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_126,
  catalogue: CATALOGUE_126,
  genererLibre: genererExercice126,
  genererVariante: construireAvecVariante126,
  largeurFigure: 320,
  figureToujoursVisible: true,
};

export function App6gen126() {
  return <AppEcransTrigo config={CONFIG} />;
}
