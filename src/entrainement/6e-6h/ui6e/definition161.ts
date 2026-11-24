import type { Exercice161 } from "../core6e/quelJeuChoisir";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Phase161 } from "./format161";
import { PHASES_161, aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, options, recap, reponse, verdict161 } from "./format161";
import { approchee, diagnostiquer, piege } from "../moteur6e/verification161";
import { correctionDetaillee161 } from "../generateurs6e/quelJeuChoisir/corrigeDetaille";

/** `6gen161` sur le socle d'écrans partagé (`AppEcransTrigo`) : P(G_A), P(G_B) (champs, trois
 * tentatives), puis le choix à trois issues (choix fermé, une tentative, jugé ✗ / ✓). */
export const DEFINITION_161: DefinitionEcrans<Exercice161, Phase161> = {
  phases: () => PHASES_161,
  estChoix: (_e, p) => p === "choix",
  mode: (e, p) => (p === "choix" ? { type: "choix", options: options() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
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
  piegeChoixRevele: true,
  bonneOption: (e) => verdict161(e),
  correction: correctionDetaillee161,
};
