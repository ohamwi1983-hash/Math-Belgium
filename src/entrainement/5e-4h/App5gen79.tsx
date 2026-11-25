import { AppEcransTrigo } from "./components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "./components5e/AppEcransTrigo";
import type { ExerciceMeilleurAjustement } from "./core5e/meilleurAjustement";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMeilleurAjustement } from "./generateurs5e/meilleurAjustement";
import { DEFINITION_MEILLEUR_AJUSTEMENT } from "./ui5e/definitionMeilleurAjustement";
import type { PhaseMeilleur } from "./ui5e/formatMeilleurAjustement";

/**
 * `5gen79` — « Quel est le meilleur ajustement ? » (5e ch. 6, § 4, processus 3 TRANSFÉRER) : deux droites
 * comparées par la somme des carrés des écarts, Mayer ou moindres carrés (droites données sans leur
 * nom), ou un point aberrant retiré. Socle `AppEcransTrigo` ; `?code=` : mêmes fonctions que
 * `generateurs5e/meilleurAjustement/exportEvaluation.ts`.
 */
const CONFIG: ConfigAppEcrans<ExerciceMeilleurAjustement, PhaseMeilleur> = {
  id: "5gen79",
  titre: "Quel est le meilleur ajustement ?",
  definition: DEFINITION_MEILLEUR_AJUSTEMENT,
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceMeilleurAjustement,
  genererVariante: construireAvecVarianteId,
  largeurFigure: 400,
  sousTitre: "Chapitre 6 — Statistique à deux variables",
};

export function App5gen79() {
  return <AppEcransTrigo config={CONFIG} />;
}
