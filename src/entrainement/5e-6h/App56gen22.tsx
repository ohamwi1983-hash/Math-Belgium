import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceRang, IdVarianteRang } from "./generateurs56/rangEpsilon";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRang } from "./generateurs56/rangEpsilon";
import { DEFINITION_RANG } from "./generateurs56/rangEpsilon/ui/definitionRang";
import type { PhaseRang } from "./generateurs56/rangEpsilon/ui/formatRang";

/**
 * `56gen22` — « Rang à partir duquel |uₙ − ℓ| < ε » (5e (6h), « Nombres réels et suites », étape 9,
 * processus 2 APPLIQUER) : suites (an + b)/(cn + d) (inéquation), ℓ + k/qⁿ ou ℓ + k·rⁿ (table de la
 * calculatrice), rapports de Fibonacci (menu Récurrence) ; m = plus petit rang tel que n > m ⇒
 * |uₙ − ℓ| < ε. Socle d'écrans partagé (`AppEcransTrigo`) ; `?code=` : mêmes fonctions que l'adaptateur.
 */
const CONFIG: ConfigAppEcrans<ExerciceRang, PhaseRang> = {
  id: "56gen22",
  titre: "Rang à partir duquel |uₙ − ℓ| < ε",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites",
  definition: DEFINITION_RANG,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceRang,
  genererVariante: (id) => construireAvecVarianteId(id as IdVarianteRang),
};

export function App56gen22() {
  return <AppEcransTrigo config={CONFIG} />;
}
