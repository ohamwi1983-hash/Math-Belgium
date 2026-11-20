import type { ExerciceLireDomaine } from "../core5e/lireDomaineImage";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseLireDomaine } from "./formatLireDomaine";
import { aide1, aide2, consigne, consigneGenerale, explication, libelle, messageIllisible, optionsExistence, PHASES, recap, reponse } from "./formatLireDomaine";
import { figureLireDomaine } from "./figureLireDomaine";
import { apercuEnsemble, RACCOURCIS_ENSEMBLE } from "../moteur5e/ensemblesReels";
import { diagnostiquer, piege } from "../moteur5e/verificationLireDomaine";
import { correctionDetailleeLireDomaine } from "../generateurs5e/lireDomaineImage/corrigeDetaille";

/** `5gen59` : dom f (champ ensemble), Im f (champ ensemble), f(a) existe ? (choix fermé, verdict). */
export const DEFINITION_LIRE_DOMAINE: DefinitionEcrans<ExerciceLireDomaine, PhaseLireDomaine> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "existence",
  mode: (e, p) => {
    if (p === "existence") return { type: "choix", options: optionsExistence(e) };
    return {
      type: "champs",
      champs: [
        {
          label: p === "domaine" ? "dom f" : "Im f",
          labelLatex: p === "domaine" ? "\\operatorname{dom}f=" : "\\operatorname{Im}f=",
          placeholder: "ex. : [−3 ; 2[ ∪ ]2 ; 5]",
          apercuLatex: apercuEnsemble,
          raccourcis: RACCOURCIS_ENSEMBLE,
        },
      ],
    };
  },
  libelle,
  consigneGenerale,
  figure: (e) => figureLireDomaine(e),
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: false,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explication(e),
  correction: correctionDetailleeLireDomaine,
};
