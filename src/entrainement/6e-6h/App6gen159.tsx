import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceRestreindre, VarianteRestreindre } from "./core6e/restreindreInverser";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRestreindre } from "./generateurs6e/restreindreInverser";
import { DEFINITION_RESTREINDRE } from "./ui6e/definitionRestreindreInverser";
import type { PhaseRestreindre } from "./ui6e/formatRestreindreInverser";

/**
 * `6gen159` — « Restreindre pour inverser » (6e ch. 1, § 1–2, processus 2 APPLIQUER) : trinôme, sin,
 * cos, tan restreints hors de la restriction principale, réciproque et lien avec arcsin, arccos,
 * arctan. Socle d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur).
 */
const CONFIG: ConfigAppEcrans<ExerciceRestreindre, PhaseRestreindre> = {
  id: "6gen159",
  titre: "Restreindre pour inverser",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
  definition: DEFINITION_RESTREINDRE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceRestreindre,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteRestreindre),
  largeurFigure: 380,
};

export function App6gen159() {
  return <AppEcransTrigo config={CONFIG} />;
}
