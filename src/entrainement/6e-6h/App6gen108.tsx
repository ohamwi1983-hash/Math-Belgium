import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceASR, PhaseASR } from "./core6e/avecSansRemise";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceASR } from "./generateurs6e/avecSansRemise";
import { DEFINITION_ASR } from "./ui6e/formatAvecSansRemise";

/**
 * `6gen108` — « Avec ou sans remise ? Choisir le modèle » (6e ch. 7, §§ 5–6, processus 3 TRANSFÉRER).
 * Modèle (choix fermé jugé ✗ / ✓, une tentative), paramètres, probabilité (exacte ou au dix-millième).
 * `?code=` : mêmes fonctions que `generateurs6e/avecSansRemise/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceASR, PhaseASR> = {
  id: "6gen108",
  titre: "Avec ou sans remise ? Choisir le modèle",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 7 — Analyse combinatoire",
  definition: DEFINITION_ASR,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceASR,
  genererVariante: construireAvecVariante,
};

export function App6gen108() {
  return <AppEcransTrigo config={CONFIG} />;
}
