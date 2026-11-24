import type { ExerciceDetectiveProba } from "../core6e/detectiveProbabilites";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseDetectiveProba } from "./formatDetectiveProbabilites";
import { aide1, aide2, champs, consigne, consigneGenerale, explicationChoix, libelle, messageIllisible, numeroLigneFausse, optionsErreur, optionsLigne, PHASES, recap, reponse } from "./formatDetectiveProbabilites";
import { copie } from "../moteur6e/modeleDetectiveProbabilites";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationDetectiveProbabilites";
import { correctionDetailleeDetectiveProba } from "../generateurs6e/detectiveProbabilites/corrigeDetaille";

/** `6gen163` : ligne fausse (choix jugé ✗ / ✓), erreur (choix jugé, 4 descriptions), correction
 * (probabilité exacte, trois tentatives). */
export const DEFINITION_DETECTIVE_PROBA: DefinitionEcrans<ExerciceDetectiveProba, PhaseDetectiveProba> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  copie: (e, p) => ({ lignes: copie(e).lignes, signalee: p === "ligne" ? null : copie(e).ligneFausse }),
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "ligne" ? `L${numeroLigneFausse(e)}` : e.variante),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDetectiveProba,
};
