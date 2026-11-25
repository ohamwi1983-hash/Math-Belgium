import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import { BoutonTablePhi } from "../components/BoutonTablePhi";
import type { ExerciceNP, PhaseNP } from "./core6e/normaleParametres";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceNP } from "./generateurs6e/normaleParametres";
import { DEFINITION_NP } from "./ui6e/formatNormaleParametres";

/**
 * `6gen120` — « Loi normale : retrouver μ ou σ » (6e ch. 8, § 6, processus 3 TRANSFÉRER). z par la table à
 * l'envers (consultable), puis le paramètre inconnu (système si deux proportions).
 * `?code=` : mêmes fonctions que `generateurs6e/normaleParametres/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceNP, PhaseNP> = {
  id: "6gen120",
  titre: "Loi normale : retrouver μ ou σ",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_NP,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceNP,
  genererVariante: construireAvecVariante,
};

export function App6gen120() {
  return (
    <>
      <AppEcransTrigo config={CONFIG} />
      <BoutonTablePhi />
    </>
  );
}
