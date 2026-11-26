import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceCredit, PhaseCredit } from "./index";
import { phasesCredit } from "./index";
import { aide1, aide2, approchee, BONNE, champs, consigne, consigneGenerale, diagnostiquer, explicationChoix, libelle, messageIllisible, options, piege, recap, reponse, tableau } from "./format";
import { correctionDetailleeCredit } from "./corrigeDetaille";
import { eurT, pourcentT } from "../finance/commun";

/** `56gen28` : taux mensuel, mensualité / montant empruntable, coût, lignes du tableau, amortissement constant. */
export const DEFINITION_CREDIT: DefinitionEcrans<ExerciceCredit, PhaseCredit> = {
  phases: phasesCredit,
  estChoix: (_e, p) => p === "nature",
  mode: (e, p) => (p === "nature" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  tableau,
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
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleeCredit,
  apercuEnonce: (e) => [tx(e.variante === "amortissementConstant" ? `Prêt de ${eurT(e.C)}, amortissement constant` : e.variante === "montantEmprunte" ? `Mensualité de ${eurT(e.m)}, TAEG ${pourcentT(e.taeg)}` : `Crédit de ${eurT(e.C)}, ${e.n} mensualités`)],
};
