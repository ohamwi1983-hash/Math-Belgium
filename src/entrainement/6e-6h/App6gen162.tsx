import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceProbaGeo, PhaseProbaGeo } from "./core6e/probabilitesGeometriques";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProbaGeo } from "./generateurs6e/probabilitesGeometriques";
import { DEFINITION_PROBA_GEO } from "./ui6e/definitionProbabilitesGeometriques";

/**
 * `6gen162` — « Probabilités géométriques » (6e ch. 6, § 1, processus 2 APPLIQUER) : cible, carré et
 * disque inscrit, rectangle et quart de disque, point sur un segment, rendez-vous. Socle d'écrans
 * partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceProbaGeo, PhaseProbaGeo> = {
  id: "6gen162",
  titre: "Probabilités géométriques",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 6 — Les probabilités",
  definition: DEFINITION_PROBA_GEO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceProbaGeo,
  genererVariante: construireAvecVariante,
  largeurFigure: 300,
};

export function App6gen162() {
  return <AppEcransTrigo config={CONFIG} />;
}
