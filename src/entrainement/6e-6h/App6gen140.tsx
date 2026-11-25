import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceMC, PhaseMC } from "./core6e/miroirsContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceMC } from "./generateurs6e/miroirsContexte";
import { DEFINITION_MC } from "./ui6e/formatMiroirsContexte";

/**
 * `6gen140` — « Miroirs en contexte » (6e ch. 10, § 6, processus 3 TRANSFÉRER). Antenne, phare,
 * lithotriteur, Cassegrain : la conique (choix jugé), son équation, deux grandeurs du contexte ;
 * réflecteur : tangente dédoublée, point T, FT = FP, rayon réfléchi. Schéma dès l'écran 2.
 * `?code=` : mêmes fonctions que `generateurs6e/miroirsContexte/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceMC, PhaseMC> = {
  id: "6gen140",
  titre: "Miroirs en contexte",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 10 — Les coniques",
  definition: DEFINITION_MC,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceMC,
  genererVariante: construireAvecVariante,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen140() {
  return <AppEcransTrigo config={CONFIG} />;
}
