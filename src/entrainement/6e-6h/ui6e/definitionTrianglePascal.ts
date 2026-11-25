import type { Exercice102, Phase102 } from "../core6e/trianglePascal";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_102, aide2_102, bonneOption102, champs102, consigne102, consigneGenerale102, figurePascal, libelle102, messageIllisible102, options102, phases102, recap102, reponse102 } from "./formatTrianglePascal";
import { diagnostiquer102, piege102 } from "../moteur6e/verificationTrianglePascal";
import { correctionDetaillee102 } from "../generateurs6e/trianglePascal/corrigeDetaille";

/** `6gen102` sur le socle d'écrans partagé : champs (trois tentatives) ; variante « identité » :
 * propriété puis vrai / faux (choix fermés, une tentative, jugés ✗ / ✓, message propre). Figure des
 * deux lignes du triangle sous l'énoncé (« ligne »). */
export const DEFINITION_102: DefinitionEcrans<Exercice102, Phase102> = {
  phases: phases102,
  estChoix: (_e, p) => p === "propriete" || p === "verdict",
  mode: (e, p) => (p === "propriete" || p === "verdict" ? { type: "choix", options: options102(p) } : { type: "champs", champs: champs102(e, p) }),
  libelle: libelle102,
  consigneGenerale: consigneGenerale102,
  figure: (e) => figurePascal(e),
  consigne: consigne102,
  aide1: aide1_102,
  aide2: aide2_102,
  diagnostiquer: diagnostiquer102,
  piege: piege102,
  messageIllisible: messageIllisible102,
  reponseAttendue: reponse102,
  recap: recap102,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: bonneOption102,
  correction: correctionDetaillee102,
};
