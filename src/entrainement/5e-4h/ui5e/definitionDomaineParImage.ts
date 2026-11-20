import type { ExerciceDomaineParImage } from "../core5e/domaineParImage";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseDomaineParImage } from "./formatDomaineParImage";
import { aide1, aide2, consigne, consigneGenerale, libelle, messageIllisible, MODE_ENSEMBLE, phases, recap, reponse } from "./formatDomaineParImage";
import { aReprendre, diagnostiquer, piege } from "../moteur5e/verificationDomaineParImage";
import { correctionDetailleeDomaineParImage } from "../generateurs5e/domaineParImage/corrigeDetaille";

/** `5gen62` : quatre écrans d'ensemble (Im g, dom f, Im g ∩ dom f, dom(f∘g)), bouton ∅ toujours
 * présent (le domaine vide n'est jamais trahi par l'écran). */
export const DEFINITION_DOMAINE_PAR_IMAGE: DefinitionEcrans<ExerciceDomaineParImage, PhaseDomaineParImage> = {
  phases,
  estChoix: () => false,
  mode: () => MODE_ENSEMBLE,
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  aReprendre,
  piege,
  messageIllisible: () => messageIllisible(),
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeDomaineParImage,
};
