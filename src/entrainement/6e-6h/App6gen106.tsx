import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceChemins, PhaseChemins } from "./core6e/cheminsQuadrillage";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChemins } from "./generateurs6e/cheminsQuadrillage";
import { DEFINITION_CHEMINS } from "./ui6e/formatCheminsQuadrillage";

/**
 * `6gen106` — « Chemins dans un quadrillage » (6e ch. 7, § 4, processus 3 TRANSFÉRER). Deux ou trois
 * écrans à champs (déplacements puis chemins ; A → P, P → B, produit ; total, par P, complément), la
 * figure sous l'énoncé. `?code=` : mêmes fonctions que `generateurs6e/cheminsQuadrillage/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceChemins, PhaseChemins> = {
  id: "6gen106",
  titre: "Chemins dans un quadrillage",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_CHEMINS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceChemins,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen106() {
  return <AppEcransTrigo config={CONFIG} />;
}
