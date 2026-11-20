import type { ExerciceLireCourbeExpo } from "../core6e/lireCourbeExponentielle";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseLireCourbeExpo } from "./formatLireCourbeExponentielle";
import { PHASES_LIRE_COURBE_EXPO, aide1, aide2, champs, consigne, consigneGenerale, figure, libelle, messageIllisible, recap, reponse } from "./formatLireCourbeExponentielle";
import { diagnostiquer, piege } from "../moteur6e/verificationLireCourbeExponentielle";
import { correctionDetailleeLireCourbeExpo } from "../generateurs6e/lireCourbeExponentielle/corrigeDetaille";

/** `6gen148` sur le socle d'écrans partagé (`AppEcransTrigo`) : quatre écrans à champ libre. */
export const DEFINITION_LIRE_COURBE_EXPO: DefinitionEcrans<ExerciceLireCourbeExpo, PhaseLireCourbeExpo> = {
  phases: () => PHASES_LIRE_COURBE_EXPO,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figure(e, "ecran"),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeLireCourbeExpo,
};
