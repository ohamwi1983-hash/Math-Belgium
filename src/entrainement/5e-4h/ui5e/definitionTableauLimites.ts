import type { ExerciceTableauLimites } from "../core5e/tableauLimitesGraphique";
import { lettreCorrecte } from "../core5e/tableauLimitesGraphique";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseTableauLimites } from "./formatTableauLimites";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, optionsGraphique, PHASES, recap, reponse, tableau } from "./formatTableauLimites";
import { diagnostiquer, piege } from "../moteur5e/verificationTableauLimites";
import { correctionDetailleeTableauLimites } from "../generateurs5e/tableauLimitesGraphique/corrigeDetaille";

/** `5gen66` : graphique (choix fermé A–D, une tentative, message ciblé sur l'intrus choisi),
 * asymptote(s) verticale(s), asymptote(s) horizontale(s) ou oblique (champs). Le tableau et les
 * quatre graphiques restent affichés sur tous les écrans. */
export const DEFINITION_TABLEAU_LIMITES: DefinitionEcrans<ExerciceTableauLimites, PhaseTableauLimites> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "graphique",
  mode: (e, p) => (p === "graphique" ? { type: "choix", options: optionsGraphique() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  tableau,
  figure: (e) => figureEcran(e),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  explicationChoix: (e) => `Le graphique ${lettreCorrecte(e)} respecte toutes les limites du tableau.`,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeTableauLimites,
};
