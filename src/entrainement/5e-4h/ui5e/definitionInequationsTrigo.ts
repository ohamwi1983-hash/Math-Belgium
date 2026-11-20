import type { ExerciceInequationTrigo } from "../core5e/inequationsTrigo";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseInequation } from "./formatInequationsTrigo";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, optionsConclusion, phases, recap, reponse, SYMBOLES_ECRAN } from "./formatInequationsTrigo";
import { figureCercleInequation } from "./figureInequationsTrigo";
import { diagnostiquer, piege } from "../moteur5e/verificationInequationsTrigo";
import { correctionDetailleeInequationTrigo } from "../generateurs5e/inequationsTrigo/corrigeDetaille";

/** Quatre écrans (isoler, arc, retour à x, intervalles) ; cas particulier : isoler puis conclusion. */
export const DEFINITION_INEQUATIONS_TRIGO: DefinitionEcrans<ExerciceInequationTrigo, PhaseInequation> = {
  phases,
  estChoix: (_e, p) => p === "conclusion",
  mode: (e, p) => {
    if (p === "conclusion") return { type: "choix", options: optionsConclusion() };
    if (p === "intervalles") return { type: "intervalles", variable: "x" };
    if (p === "isoler") return { type: "champs", champs: champs(e, p), symboles: { label: "Symbole", options: SYMBOLES_ECRAN } };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  // Figure : la droite seule pour lire l'arc (écran « arc »), l'arc validé ensuite comme support.
  figure: (e, p) => (e.cas || p === "isoler" ? null : figureCercleInequation(e, p !== "arc")),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => explicationChoix(e),
  correction: correctionDetailleeInequationTrigo,
};
