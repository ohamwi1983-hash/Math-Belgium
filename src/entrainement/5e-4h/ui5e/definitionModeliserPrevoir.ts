import type { ExerciceModeliserPrevoir } from "../core5e/modeliserPrevoir";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseModeliser } from "./formatModeliserPrevoir";
import {
  aide1,
  aide2,
  bonneFiabilite,
  bonneNature,
  champs,
  consigne,
  consigneGenerale,
  explicationChoix,
  figure,
  libelle,
  messageIllisible,
  optionsFiabilite,
  optionsNature,
  PHASES_MODELISER,
  recap,
  reponse,
  tableau,
} from "./formatModeliserPrevoir";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationModeliserPrevoir";
import { correctionDetailleeModeliserPrevoir } from "../generateurs5e/modeliserPrevoir/corrigeDetaille";
import { lx, tx } from "./ecransTrigo.types";

/** `5gen78` : droite des moindres carrés, r, fiabilité (choix), prévision, nature (choix), seuil. */
export const DEFINITION_MODELISER_PREVOIR: DefinitionEcrans<ExerciceModeliserPrevoir, PhaseModeliser> = {
  phases: () => PHASES_MODELISER,
  estChoix: (_e, p) => p === "fiabilite" || p === "nature",
  mode: (e, p) => {
    if (p === "fiabilite") return { type: "choix", options: optionsFiabilite(e) };
    if (p === "nature") return { type: "choix", options: optionsNature(e) };
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
  bonneOption: (e, p) => (p === "fiabilite" ? bonneFiabilite(e) : bonneNature(e)),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeModeliserPrevoir,
  apercuEnonce: (e) => [tx(`${e.points.length} relevés — droite des moindres carrés `), lx("y=ax+b")],
};
