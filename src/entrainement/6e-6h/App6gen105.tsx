import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceAMU, PhaseAMU } from "./core6e/auMoinsUnComplement";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAMU } from "./generateurs6e/auMoinsUnComplement";
import { DEFINITION_AMU } from "./ui6e/formatAuMoinsUnComplement";

/**
 * `6gen105` — « Au moins un : le complément » (6e ch. 7, § 2, processus 3 TRANSFÉRER). Stratégie
 * (choix fermé jugé ✗ / ✓, une tentative), les deux nombres (deux champs), le résultat.
 * `?code=` : mêmes fonctions que `generateurs6e/auMoinsUnComplement/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceAMU, PhaseAMU> = {
  id: "6gen105",
  titre: "Au moins un : le complément",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_AMU,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceAMU,
  genererVariante: construireAvecVariante,
};

export function App6gen105() {
  return <AppEcransTrigo config={CONFIG} />;
}
