import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceProblemesArcfonctions, VarianteProblemesArcfonctions } from "./core6e/problemesArcfonctions";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProblemesArcfonctions } from "./generateurs6e/problemesArcfonctions";
import { DEFINITION_PROBLEMES_ARCFONCTIONS } from "./ui6e/definitionProblemesArcfonctions";
import type { PhaseProblemesArcfonctions } from "./ui6e/formatProblemesArcfonctions";

/**
 * `6gen156` — « Problèmes avec arcfonctions » (6e ch. 1, § 2 et § 4, processus 3 TRANSFÉRER,
 * calculatrice indispensable) : réfraction, angle limite, angle de vue, échelle. Socle d'écrans
 * partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceProblemesArcfonctions, PhaseProblemesArcfonctions> = {
  id: "6gen156",
  titre: "Problèmes avec arcfonctions",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 1 — Fonctions réciproques & cyclométriques",
  definition: DEFINITION_PROBLEMES_ARCFONCTIONS,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceProblemesArcfonctions,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteProblemesArcfonctions),
  largeurFigure: 340,
};

export function App6gen156() {
  return <AppEcransTrigo config={CONFIG} />;
}
