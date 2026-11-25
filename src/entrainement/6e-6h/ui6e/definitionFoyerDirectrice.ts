import type { Exercice135, Phase135 } from "../core6e/foyerDirectrice";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_135, aide2_135, bonneOption135, champs135, consigne135, consigneGenerale135, estChoix135, figure135, libelle135, messageIllisible135, options135, phases135, recap135, reponse135 } from "./formatFoyerDirectrice";
import { approchee135, diagnostiquer135, piege135 } from "../moteur6e/verificationFoyerDirectrice";
import { correctionDetaillee135 } from "../generateurs6e/foyerDirectrice/corrigeDetaille";

/** `6gen135` sur le socle d'écrans partagé : nature (choix fermé, une tentative, jugé ✗ / ✓), équation et
 * sommet (trois tentatives, illisible et valeur approchée sans tentative). */
export const DEFINITION_135: DefinitionEcrans<Exercice135, Phase135> = {
  phases: phases135,
  estChoix: estChoix135,
  mode: (e, p) => (estChoix135(e, p) ? { type: "choix", options: options135() } : { type: "champs", champs: champs135(e, p) }),
  libelle: libelle135,
  consigneGenerale: consigneGenerale135,
  figure: (e) => figure135(e),
  consigne: consigne135,
  approchee: approchee135,
  aide1: aide1_135,
  aide2: aide2_135,
  diagnostiquer: diagnostiquer135,
  piege: piege135,
  messageIllisible: messageIllisible135,
  reponseAttendue: reponse135,
  recap: recap135,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => bonneOption135(e),
  correction: correctionDetaillee135,
};
