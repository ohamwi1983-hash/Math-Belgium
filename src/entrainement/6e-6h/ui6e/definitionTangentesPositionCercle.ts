import type { Exercice126, Phase126 } from "../core6e/tangentesPositionCercle";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import {
  aide1_126,
  aide2_126,
  bonneOption126,
  champs126,
  consigne126,
  consigneGenerale126,
  estChoix126,
  figure126,
  libelle126,
  messageIllisible126,
  options126,
  phases126,
  recap126,
  reponse126,
} from "./formatTangentesPositionCercle";
import { approchee126, diagnostiquer126, piege126 } from "../moteur6e/verificationTangentesPositionCercle";
import { correctionDetaillee126 } from "../generateurs6e/tangentesPositionCercle/corrigeDetaille";

/** `6gen126` sur le socle d'écrans partagé : écrans à champs (trois tentatives, illisible et valeur
 * approchée sans tentative) et choix fermé de la position (une tentative, jugé ✗ / ✓). */
export const DEFINITION_126: DefinitionEcrans<Exercice126, Phase126> = {
  phases: phases126,
  estChoix: estChoix126,
  mode: (e, p) => (estChoix126(e, p) ? { type: "choix", options: options126() } : { type: "champs", champs: champs126(e, p) }),
  libelle: libelle126,
  consigneGenerale: consigneGenerale126,
  figure: figure126,
  consigne: consigne126,
  approchee: approchee126,
  aide1: aide1_126,
  aide2: aide2_126,
  diagnostiquer: diagnostiquer126,
  piege: piege126,
  messageIllisible: messageIllisible126,
  reponseAttendue: reponse126,
  recap: recap126,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneOption126(e),
  correction: correctionDetaillee126,
};
