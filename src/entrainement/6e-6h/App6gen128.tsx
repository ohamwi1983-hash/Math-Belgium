import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import type { ExerciceTL, PhaseTL } from "./core6e/traduireLieu";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTL } from "./generateurs6e/traduireLieu";
import { DEFINITION_TL } from "./ui6e/formatTraduireLieu";

/**
 * `6gen128` — « Traduire un lieu : réciproque et points exclus » (6e ch. 9, § 4, processus 3
 * TRANSFÉRER). Équation du lieu complet, nombre de points exclus (verdict, choix jugé), ces points, la
 * raison ; figure de la configuration, lieu tracé après la première réponse. Quatre puces pour tous les
 * verdicts (structure fixe). `?code=` : mêmes fonctions que `generateurs6e/traduireLieu/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceTL, PhaseTL> = {
  id: "6gen128",
  titre: "Traduire un lieu : réciproque et points exclus",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 9 — Lieux géométriques",
  definition: DEFINITION_TL,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceTL,
  genererVariante: construireAvecVariante,
  nombrePuces: 4,
  largeurFigure: 340,
  figureToujoursVisible: true,
};

export function App6gen128() {
  return <AppEcransTrigo config={CONFIG} />;
}
