import type { ExerciceLectureTangente } from "../core5e/lectureTangente";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseLectureTangente } from "./formatLectureTangente";
import { aide1, aide2, champs, consigne, consigneGenerale, figureEnonce, libelle, messageIllisible, optionsComparer, optionsGraphique, phases, recap, reponse } from "./formatLectureTangente";
import { diagnostiquer, explicationChoix, piege } from "../moteur5e/verificationLectureTangente";
import { correctionDetailleeLectureTangente } from "../generateurs5e/lectureTangente/corrigeDetaille";

/** `5gen73` : f(a) lu, f′(a) par deux nœuds de t, équation de t, comparaison des nombres dérivés
 * (choix fermé jugé ✗ / ✓) ; variante inverse : f(a), f′(a), graphique (choix fermé jugé). */
export const DEFINITION_LECTURE_TANGENTE: DefinitionEcrans<ExerciceLectureTangente, PhaseLectureTangente> = {
  phases,
  estChoix: (_e, p) => p === "comparer" || p === "graphique",
  mode: (e, p) => {
    if (p === "comparer") return { type: "choix", options: optionsComparer(e) };
    if (p === "graphique") return { type: "choix", options: optionsGraphique(e) };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  figure: (e) => figureEnonce(e),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  explicationChoix,
  bonneOption: (_e, p) => (p === "comparer" ? "o0" : "g0"),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeLectureTangente,
};
