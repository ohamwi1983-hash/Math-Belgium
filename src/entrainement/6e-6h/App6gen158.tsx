import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceLireTransformee, VarianteLireTransformee } from "./core6e/lireTransformeeArc";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireTransformee } from "./generateurs6e/lireTransformeeArc";
import { DEFINITION_LIRE_TRANSFORMEE } from "./ui6e/definitionLireTransformeeArc";
import type { PhaseLireTransformee } from "./ui6e/formatLireTransformeeArc";

/**
 * `6gen158` — « Lire une transformée c + k·arc(mx + n) » (6e ch. 1, § 5, processus 2 APPLIQUER) :
 * domaine et image lus sur une grille honnête, puis m, n, k, c. Socle d'écrans partagé
 * (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceLireTransformee, PhaseLireTransformee> = {
  id: "6gen158",
  titre: "Lire une transformée c + k·arc(mx + n)",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
  definition: DEFINITION_LIRE_TRANSFORMEE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLireTransformee,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteLireTransformee),
  largeurFigure: 380,
};

export function App6gen158() {
  return <AppEcransTrigo config={CONFIG} />;
}
