import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceTD, PhaseTD } from "./core6e/tangenteDeriveeDedoublee";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTD } from "./generateurs6e/tangenteDeriveeDedoublee";
import { DEFINITION_TD } from "./ui6e/formatTangenteDeriveeDedoublee";

/**
 * `6gen138` — « Tangente par la dérivée et forme dédoublée » (6e ch. 10, § 5, processus 2 APPLIQUER).
 * Fonction dont le graphique contient P (choix jugé), pente f′(x_P), tangente en P, tangente en Q par la
 * forme dédoublée (Q sommet de l'axe focal une fois sur deux) ; figure de la conique, P et Q.
 * `?code=` : mêmes fonctions que `generateurs6e/tangenteDeriveeDedoublee/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTD, PhaseTD> = {
  id: "6gen138",
  titre: "Tangente par la dérivée et forme dédoublée",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_TD,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTD,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen138() {
  return <AppEcransTrigo config={CONFIG} />;
}
