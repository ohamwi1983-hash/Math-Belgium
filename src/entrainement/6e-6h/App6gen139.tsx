import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExercicePD, PhasePD } from "./core6e/positionDroiteParametre";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePD } from "./generateurs6e/positionDroiteParametre";
import { DEFINITION_PD } from "./ui6e/formatPositionDroiteParametre";

/**
 * `6gen139` — « Position d'une droite et d'une conique selon un paramètre » (6e ch. 10, § 4–5, processus 3
 * TRANSFÉRER). Équation en x en fonction de k, valeurs de tangence, position de d_{k₀} (choix jugé, verdict
 * tiré avant les nombres), points communs ; figure : la conique, puis d_{k₀} une fois la position trouvée.
 * `?code=` : mêmes fonctions que `generateurs6e/positionDroiteParametre/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExercicePD, PhasePD> = {
  id: "6gen139",
  titre: "Position d'une droite et d'une conique selon un paramètre",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_PD,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExercicePD,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen139() {
  return <AppEcransTrigo config={CONFIG} />;
}
