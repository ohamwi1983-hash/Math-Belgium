import type { DefinitionEcrans } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceQuantif, PhaseQuantif } from "../core/types";
import { aide1, aide2, consigne, consigneGenerale, explication, libelle, messageIllisible, options, phases, recap, reponse } from "./format";
import { bonneOption, diagnostiquer, piege } from "../moteur/verification";
import { correctionDetailleeQuantif } from "../corrigeDetaille";

/** `56gen17` : trois choix fermés par exercice, jugés ✗ / ✓ et figés ; deux niveaux d'aide. */
export const DEFINITION_QUANTIF: DefinitionEcrans<ExerciceQuantif, PhaseQuantif> = {
  phases,
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
  messageIllisible: () => messageIllisible(),
  reponseAttendue: reponse,
  recap,
  explicationChoix: explication,
  correction: correctionDetailleeQuantif,
};
