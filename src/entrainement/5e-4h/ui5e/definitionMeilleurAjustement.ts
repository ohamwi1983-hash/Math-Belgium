import type { ExerciceMeilleurAjustement } from "../core5e/meilleurAjustement";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { PhaseMeilleur } from "./formatMeilleurAjustement";
import {
  aide1,
  aide2,
  bonneRepere,
  bonneVerdict,
  champs,
  consigne,
  consigneGenerale,
  explicationChoix,
  figure,
  libelle,
  messageIllisible,
  optionsRepere,
  optionsVerdict,
  phases,
  recap,
  reponse,
  tableau,
} from "./formatMeilleurAjustement";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationMeilleurAjustement";
import { correctionDetailleeMeilleurAjustement } from "../generateurs5e/meilleurAjustement/corrigeDetaille";

/** `5gen79` : deux droites (écart, S₁, S₂, verdict), Mayer ou moindres carrés (G, S₁, S₂, verdict), point aberrant. */
export const DEFINITION_MEILLEUR_AJUSTEMENT: DefinitionEcrans<ExerciceMeilleurAjustement, PhaseMeilleur> = {
  phases,
  estChoix: (_e, p) => p === "verdict" || p === "repere",
  mode: (e, p) => {
    if (p === "verdict") return { type: "choix", options: optionsVerdict(e) };
    if (p === "repere") return { type: "choix", options: optionsRepere(e) };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  tableau,
  figure,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  approchee,
  diagnostiquer,
  piege,
  bonneOption: (e, p) => (p === "repere" ? bonneRepere(e) : bonneVerdict(e)),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeMeilleurAjustement,
  apercuEnonce: (e) =>
    e.variante === "aberrant" ? [tx(`${e.points.length} relevés, un point aberrant`)] : [tx(`${e.points.length} points, droites `), lx("d_1"), tx(" et "), lx("d_2")],
};
