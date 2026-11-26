import type { DefinitionEcrans } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceQuelleFormule, PhaseQuelleFormule } from "./index";
import { aide1, aide2, bonneOption, consigne, consigneGenerale, diagnostiquer, explicationChoix, libelle, options, PHASES, piege, recap, reponse } from "./format";
import { correctionDetailleeQuelleFormule } from "./corrigeDetaille";

/** `56gen23` : trois choix fermés jugés ✗ / ✓ (famille, grandeur, formule), une tentative chacun. */
export const DEFINITION_QUELLE_FORMULE: DefinitionEcrans<ExerciceQuelleFormule, PhaseQuelleFormule> = {
  phases: () => PHASES,
  estChoix: () => true,
  mode: (e, p) => ({ type: "choix", options: options(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption,
  messageIllisible: () => "",
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeQuelleFormule,
  apercuEnonce: (e) => [tx(e.modele.enonce.length > 90 ? `${e.modele.enonce.slice(0, 88)}…` : e.modele.enonce)],
};
