import type { ExerciceGrapheReciproque } from "../core6e/grapheReciproque.types";
import type { DefinitionEcrans } from "./ecransExp.types";
import type { PhaseGrapheReciproque } from "./formatGrapheReciproque";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsGraphe, PHASES_GRAPHE, recap, reponse } from "./formatGrapheReciproque";
import { figureCandidats, figurePrincipale } from "./figureGrapheReciproque";
import { diagnostiquer, piege } from "../moteur6e/verificationGrapheReciproque";
import { correctionDetailleeGrapheReciproque } from "../generateurs6e/grapheReciproque/corrigeDetaille";

/** `6gen154` : point A′ (deux champs), domaine et image (deux champs), graphe (choix fermé), pentes (deux champs). */
export const DEFINITION_GRAPHE_RECIPROQUE: DefinitionEcrans<ExerciceGrapheReciproque, PhaseGrapheReciproque> = {
  phases: () => PHASES_GRAPHE,
  estChoix: (_e, p) => p === "graphe",
  mode: (e, p) => (p === "graphe" ? { type: "choix", options: optionsGraphe() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e, p) => (p === "graphe" ? figureCandidats(e) : figurePrincipale(e, { tangente: p === "pente" })),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleeGrapheReciproque,
};
