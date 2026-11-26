import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceInteretsComposes, PhaseInteretsComposes } from "./generateurs56/interetsComposes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretsComposes } from "./generateurs56/interetsComposes";
import { DEFINITION_INTERETS_COMPOSES_56 } from "./generateurs56/interetsComposes/definition";

/**
 * `56gen25` — « Intérêts composés » (5e (6h), « Nombres réels et suites », étape 11) : valeur acquise,
 * valeur actuelle, taux (racine n-ième), durée entière par la table, doublement, convention mixte.
 * Socle d'écrans partagé ; `?code=` : mêmes fonctions que `generateurs56/interetsComposes/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceInteretsComposes, PhaseInteretsComposes> = {
  id: "56gen25",
  titre: "Intérêts composés",
  eyebrow: "5e (6h) — Entraînement",
  sousTitre: "Nombres réels et suites — Algèbre financière",
  definition: DEFINITION_INTERETS_COMPOSES_56,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceInteretsComposes,
  genererVariante: construireAvecVarianteId,
};

export function App56gen25() {
  return <AppEcransTrigo config={CONFIG} />;
}
