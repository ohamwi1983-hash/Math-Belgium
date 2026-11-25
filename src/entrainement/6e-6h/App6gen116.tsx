import { AppEcransTrigo } from "../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../5e-4h/components5e/AppEcransTrigo";
import { BoutonTablePhi } from "../components/BoutonTablePhi";
import type { ExerciceLTP, PhaseLTP } from "./core6e/lectureTablePhi";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLTP } from "./generateurs6e/lectureTablePhi";
import { DEFINITION_LTP } from "./ui6e/formatLectureTablePhi";

/**
 * `6gen116` — « Lire la table de Φ » (6e ch. 8, § 6, processus 1 CONNAÎTRE). Table complète consultable
 * (bouton « Table de Φ », hors du socle d'écrans) ; deux écrans par variante.
 * `?code=` : mêmes fonctions que `generateurs6e/lectureTablePhi/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceLTP, PhaseLTP> = {
  id: "6gen116",
  titre: "Lire la table de Φ",
  eyebrow: "6e — Entraînement",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  definition: DEFINITION_LTP,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLTP,
  genererVariante: construireAvecVariante,
};

export function App6gen116() {
  return (
    <>
      <AppEcransTrigo config={CONFIG} />
      <BoutonTablePhi />
    </>
  );
}
