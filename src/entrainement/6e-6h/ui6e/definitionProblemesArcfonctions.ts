import type { ExerciceProblemesArcfonctions } from "../core6e/problemesArcfonctions";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseProblemesArcfonctions } from "./formatProblemesArcfonctions";
import { PHASES_PROBLEMES, aide1, aide2, champs, consigne, consigneGenerale, estChoix, explicationChoix, libelle, messageIllisible, options, recap, reponse } from "./formatProblemesArcfonctions";
import { figureProbleme } from "./figureProblemesArcfonctions";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationProblemesArcfonctions";
import { correctionDetailleeProblemesArcfonctions } from "../generateurs6e/problemesArcfonctions/corrigeDetaille";

/** `6gen156` sur le socle d'écrans partagé : trois questions (champs), le verdict « rayon réfracté ? »
 * en choix fermé (une tentative, deux niveaux d'aide). */
export const DEFINITION_PROBLEMES_ARCFONCTIONS: DefinitionEcrans<ExerciceProblemesArcfonctions, PhaseProblemesArcfonctions> = {
  phases: () => PHASES_PROBLEMES,
  estChoix,
  mode: (e, p) => (e.variante === "reflexion-totale" && estChoix(e, p) ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureProbleme(e),
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  aidesChoixDeuxNiveaux: true,
  explicationChoix,
  correction: correctionDetailleeProblemesArcfonctions,
};
