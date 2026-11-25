import type { Exercice112, Phase112 } from "../core6e/fonctionRepartition";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1_112, aide2_112, champs112, consigne112, consigneGenerale112, libelle112, messageIllisible112, options112, phases112, recap112, reponse112, tableau112 } from "./formatFonctionRepartition";
import { approchee112, diagnostiquer112, piege112 } from "../moteur6e/verificationFonctionRepartition";
import { correctionDetaillee112 } from "../generateurs6e/fonctionRepartition/corrigeDetaille";

/** `6gen112` sur le socle d'écrans partagé : champs (trois tentatives, illisible et approchée sans
 * tentative ; densité : expression en x avec aperçu KaTeX) ; choix de la fonction de répartition en
 * choix fermé jugé ✗ / ✓ (une tentative, deux niveaux d'aide, raison affichée). */
export const DEFINITION_112: DefinitionEcrans<Exercice112, Phase112> = {
  phases: phases112,
  estChoix: (_e, p) => p === "choix",
  mode: (e, p) => (p === "choix" ? { type: "choix", options: options112(e) } : { type: "champs", champs: champs112(e, p) }),
  libelle: libelle112,
  consigneGenerale: consigneGenerale112,
  tableau: tableau112,
  consigne: consigne112,
  approchee: approchee112,
  aide1: aide1_112,
  aide2: aide2_112,
  diagnostiquer: diagnostiquer112,
  piege: piege112,
  messageIllisible: messageIllisible112,
  reponseAttendue: reponse112,
  recap: recap112,
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: (e) => String(e.numeroValide ?? 1),
  correction: correctionDetaillee112,
};
