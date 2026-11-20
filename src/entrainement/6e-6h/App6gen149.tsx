import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceTangenteExpo, VarianteTangenteExpo } from "./core6e/tangenteExponentielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangenteExpo } from "./generateurs6e/tangenteExponentielle";
import { DEFINITION_TANGENTE_EXPO } from "./ui6e/definitionTangenteExponentielle";
import type { PhaseTangenteExpo } from "./ui6e/formatTangenteExponentielle";

/**
 * `6gen149` — « Tangente à une exponentielle et nombre ln a » (6e ch. 2, § 2, processus 2
 * APPLIQUER). ln a = pente en (0 ; 1) de aˣ (exacte ou touche ln), tangente en x₀ à k·aˣ ou k·e^{mx}.
 * Socle d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceTangenteExpo, PhaseTangenteExpo> = {
  id: "6gen149",
  titre: "Tangente à une exponentielle et nombre ln a",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 2 — Fonctions exponentielles",
  definition: DEFINITION_TANGENTE_EXPO,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTangenteExpo,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteTangenteExpo),
};

export function App6gen149() {
  return <AppEcransTrigo config={CONFIG} />;
}
