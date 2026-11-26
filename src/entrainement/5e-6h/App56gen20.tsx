import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceHeron, IdVarianteHeron } from "./generateurs56/heron";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHeron } from "./generateurs56/heron";
import { DEFINITION_HERON } from "./generateurs56/heron/ui/definitionHeron";
import type { PhaseHeron } from "./generateurs56/heron/ui/formatHeron";

/**
 * `56gen20` — « Héron et encadrements successifs » (5e (6h), « Nombres réels et suites », étape 5,
 * processus 2 APPLIQUER, calculatrice : menu Récurrence). Quatre écrans : rectangles de Héron pour √A
 * (deuxième rectangle, encadrement, premier écart < 10⁻ᵏ, valeur approchée) ou méthode des puissances
 * (deux carrés u − v√p, fraction irréductible, écart). Socle d'écrans partagé (`AppEcransTrigo`) ;
 * `?code=` : mêmes fonctions que l'adaptateur papier.
 */
const CONFIG: ConfigAppEcrans<ExerciceHeron, PhaseHeron> = {
  id: "56gen20",
  titre: "Héron et encadrements successifs",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
  definition: DEFINITION_HERON,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceHeron,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteHeron),
};

export function App56gen20() {
  return <AppEcransTrigo config={CONFIG} />;
}
