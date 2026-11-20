import type { ExerciceEtudeCyclo } from "../core6e/etudeCyclometrique";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseEtudeCyclo } from "./formatEtudeCyclometrique";
import { PHASES_ETUDE, aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, options, recap, reponse } from "./formatEtudeCyclometrique";
import { approchee, diagnostiquer, explicationChoix, piege } from "../moteur6e/verificationEtudeCyclometrique";
import { correctionDetailleeEtudeCyclo } from "../generateurs6e/etudeCyclometrique/corrigeDetaille";

/** `6gen157` sur le socle d'écrans partagé : domaine (intervalles), dérivée (expression), zéros (liste),
 * variations (choix fermé, une tentative), valeurs du tableau (champs exacts). */
export const DEFINITION_ETUDE_CYCLO: DefinitionEcrans<ExerciceEtudeCyclo, PhaseEtudeCyclo> = {
  phases: () => PHASES_ETUDE,
  estChoix: (_e, p) => p === "variations",
  mode: (e, p) => {
    if (p === "domaine") return { type: "intervalles", variable: "x", placeholders: ["ex. : -1 ou -∞", "ex. : 1 ou +∞"] };
    if (p === "variations") return { type: "choix", options: options(e) };
    return { type: "champs", champs: champs(e, p) };
  },
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  aidesChoixDeuxNiveaux: true,
  explicationChoix,
  correction: correctionDetailleeEtudeCyclo,
};
