import type { ExerciceFonctionAsymptotes } from "../core5e/fonctionAsymptotes";
import { estGraphique } from "../core5e/fonctionAsymptotes";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseFonctionAsymptotes } from "./formatFonctionAsymptotes";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEcran, libelle, messageIllisible, PHASES, recap, reponse } from "./formatFonctionAsymptotes";
import { diagnostiquer, piege } from "../moteur5e/verificationFonctionAsymptotes";
import { correctionDetailleeFonctionAsymptotes } from "../generateurs5e/fonctionAsymptotes/corrigeDetaille";

/** `5gen65` : asymptote verticale, horizontale / oblique, point (champs numériques), f(x)
 * (expression), vérification (limite à droite de p). Figure seulement pour les variantes graphiques. */
export const DEFINITION_FONCTION_ASYMPTOTES: DefinitionEcrans<ExerciceFonctionAsymptotes, PhaseFonctionAsymptotes> = {
  phases: () => PHASES,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => (estGraphique(e) ? figureEcran(e) : null),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeFonctionAsymptotes,
};
