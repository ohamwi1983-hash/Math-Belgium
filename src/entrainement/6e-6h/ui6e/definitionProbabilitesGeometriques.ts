import type { ExerciceProbaGeo, PhaseProbaGeo } from "../core6e/probabilitesGeometriques";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, phases, recap, reponse } from "./formatProbabilitesGeometriques";
import { figureProbaGeo } from "./figureProbabilitesGeometriques";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationProbabilitesGeometriques";
import { correctionDetailleeProbaGeo } from "../generateurs6e/probabilitesGeometriques/corrigeDetaille";

/** `6gen162` sur le socle d'écrans partagé : deux ou trois champs (aire / longueur totale, zone,
 * probabilité ou rayon), trois tentatives chacun ; la figure reste sous l'énoncé à chaque écran. */
export const DEFINITION_PROBA_GEO: DefinitionEcrans<ExerciceProbaGeo, PhaseProbaGeo> = {
  phases,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure: (e) => figureProbaGeo(e),
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeProbaGeo,
};
