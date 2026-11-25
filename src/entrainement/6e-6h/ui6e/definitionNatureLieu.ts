import type { Exercice127, Phase127 } from "../core6e/natureLieu";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_127, aide2_127, champs127, consigne127, consigneGenerale127, figure127, libelle127, messageIllisible127, options127, phases127, recap127, reponse127 } from "./formatNatureLieu";
import { approchee127, diagnostiquer127, piege127 } from "../moteur6e/verificationNatureLieu";
import { correctionDetaillee127 } from "../generateurs6e/natureLieu/corrigeDetaille";

/** `6gen127` sur le socle d'écrans partagé : nature (choix fermé jugé ✗ / ✓, une tentative, message
 * propre à la condition), puis éléments caractéristiques (champs à trois tentatives) ; deux puces
 * fixes (`nombrePuces`) : un lieu vide n'a pas de second écran, sans que cela se voie avant. */
export const DEFINITION_127: DefinitionEcrans<Exercice127, Phase127> = {
  phases: phases127,
  estChoix: (_e, p) => p === "nature",
  mode: (e, p) => (p === "nature" ? { type: "choix", options: options127(e) } : { type: "champs", champs: champs127(e, p) }),
  libelle: libelle127,
  consigneGenerale: consigneGenerale127,
  figure: (e) => figure127(e),
  consigne: consigne127,
  approchee: approchee127,
  aide1: aide1_127,
  aide2: aide2_127,
  diagnostiquer: diagnostiquer127,
  piege: piege127,
  messageIllisible: messageIllisible127,
  reponseAttendue: reponse127,
  recap: recap127,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => e.nature,
  correction: correctionDetaillee127,
};
