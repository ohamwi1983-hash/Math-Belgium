import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceInteretsComposes, VarianteInteretsComposes } from "./core6e/interetsComposes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretsComposes } from "./generateurs6e/interetsComposes";
import { DEFINITION_INTERETS_COMPOSES } from "./ui6e/definitionInteretsComposes";
import type { PhaseInteretsComposes } from "./ui6e/formatInteretsComposes";

/**
 * `6gen151` — « Intérêts composés et nombre e » (6e ch. 2, § 2, processus 3 TRANSFÉRER,
 * calculatrice indispensable) : le problème de Bernoulli, la limite K₀·e^{rt}, le taux équivalent.
 * Socle d'écrans partagé (`AppEcransTrigo`, `?code=` = mêmes fonctions que l'adaptateur papier).
 */
const CONFIG: ConfigAppEcrans<ExerciceInteretsComposes, PhaseInteretsComposes> = {
  id: "6gen151",
  titre: "Intérêts composés et nombre e",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 2 — Fonctions exponentielles",
  definition: DEFINITION_INTERETS_COMPOSES,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceInteretsComposes,
  genererVariante: (id) => construireAvecVarianteId(id as VarianteInteretsComposes),
};

export function App6gen151() {
  return <AppEcransTrigo config={CONFIG} />;
}
