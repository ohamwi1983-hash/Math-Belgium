import type { ExerciceFonctionConditions } from "../core5e/fonctionConditions";
import { idSysteme } from "../core5e/fonctionConditions";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseFonctionConditions } from "./formatFonctionConditions";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, optionsNatureEcran, optionsSysteme, PHASES, recap, reponse } from "./formatFonctionConditions";
import { diagnostiquer, piege } from "../moteur5e/verificationFonctionConditions";
import { correctionDetailleeFonctionConditions } from "../generateurs5e/fonctionConditions/corrigeDetaille";

const CHOIX: PhaseFonctionConditions[] = ["systeme", "nature"];

/** `5gen69` : c et d (deux nombres), système (choix fermé, jugé ✗ / ✓), a et b, f′(x) ou f″(x),
 * nature (choix fermé, jugé ✗ / ✓). */
export const DEFINITION_FONCTION_CONDITIONS: DefinitionEcrans<ExerciceFonctionConditions, PhaseFonctionConditions> = {
  phases: () => PHASES,
  estChoix: (_e, p) => CHOIX.includes(p),
  mode: (e, p) => {
    if (p === "systeme") return { type: "choix", options: optionsSysteme(e) };
    if (p === "nature") return { type: "choix", options: optionsNatureEcran(e) };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "systeme" ? idSysteme(0) : e.nature),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeFonctionConditions,
};
