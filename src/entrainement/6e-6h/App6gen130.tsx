import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceLC, PhaseLC } from "./core6e/lieuxContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLC } from "./generateurs6e/lieuxContexte";
import { DEFINITION_LC } from "./ui6e/formatLieuxContexte";

/**
 * `6gen130` — « Lieux en contexte : un point qui bouge » (6e ch. 9, § 5, processus 3 TRANSFÉRER). Point
 * mobile en fonction du paramètre (ou seconde génératrice), lieu complet, partie décrite (choix jugé),
 * extrémités ; figure de la situation à une position, lieu tracé après l'équation.
 * `?code=` : mêmes fonctions que `generateurs6e/lieuxContexte/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLC, PhaseLC> = {
  id: "6gen130",
  titre: "Lieux en contexte : un point qui bouge",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_LC,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLC,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen130() {
  return <AppEcransTrigo config={CONFIG} />;
}
