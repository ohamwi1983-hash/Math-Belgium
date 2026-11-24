import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceDerivabilite } from "./core5e/derivabilite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDerivabilite } from "./generateurs5e/derivabilite";
import { DEFINITION_DERIVABILITE } from "./ui5e/definitionDerivabilite";
import type { PhaseDerivabilite } from "./ui5e/formatDerivabilite";

/**
 * `5gen75` — « Dérivable ou non en a ? » (5e ch. 5, § 3 et § 4, processus 2 APPLIQUER ; version
 * modeste : morceaux polynomiaux, |x − a|, √(x − a)). Continuité, nombres dérivés à gauche et à
 * droite, verdict, tangente si dérivable. Cinq puces fixes (le nombre d'écrans ne trahit pas le
 * verdict avant qu'il soit donné). Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/derivabilite/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceDerivabilite, PhaseDerivabilite> = {
  id: "5gen75",
  titre: "Dérivable ou non en a ?",
  definition: DEFINITION_DERIVABILITE,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceDerivabilite,
  genererVariante: construireAvecVarianteId,
  nombrePuces: 5,
  sousTitre: "Chapitre 5 — Dérivées et applications",
};

export function App5gen75() {
  return <AppEcransTrigo config={CONFIG} />;
}
