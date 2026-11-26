import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTauxEquivalents, PhaseTauxEquivalents } from "./index";
import { phasesTauxEquivalents } from "./index";
import { aide1, aide2, approchee, BONNE, champs, consigne, consigneGenerale, diagnostiquer, explicationChoix, libelle, messageIllisible, options, piege, recap, reponse } from "./format";
import { correctionDetailleeTauxEquivalents } from "./corrigeDetaille";

const CHOIX: PhaseTauxEquivalents[] = ["relation", "choix"];

/** `56gen26` : relation des taux (choix), taux équivalents, offre la plus avantageuse (choix), précompte, dépréciation. */
export const DEFINITION_TAUX_EQUIVALENTS: DefinitionEcrans<ExerciceTauxEquivalents, PhaseTauxEquivalents> = {
  phases: phasesTauxEquivalents,
  estChoix: (_e, p) => CHOIX.includes(p),
  mode: (e, p) => (CHOIX.includes(p) ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  approchee,
  diagnostiquer,
  piege,
  bonneOption: () => BONNE,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeTauxEquivalents,
  apercuEnonce: (e) => [tx(e.variante === "comparer" ? "Comparer deux offres" : e.variante === "precompte" ? "Précompte et taux net" : e.variante === "depreciation" ? "Dépréciation d'une voiture" : "Taux équivalents")],
};
