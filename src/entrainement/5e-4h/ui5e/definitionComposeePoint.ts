import type { ExerciceComposeePoint } from "../core5e/composeePoint";
import { nomExt } from "../core5e/composeePoint";
import type { DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseComposeePoint } from "./formatComposeePoint";
import { aide1, aide2, composeeL, consigne, consigneGenerale, libelle, messageIllisible, optionsExistence, phases, recap, reponse, SYMBOLES_FONCTION } from "./formatComposeePoint";
import { approchee, diagnostiquer, piege } from "../moteur5e/verificationComposeePoint";
import { saisieTrigVersLatex } from "../moteur5e/saisieTrig";
import { correctionDetailleeComposeePoint } from "../generateurs5e/composeePoint/corrigeDetaille";

/** Aperçu KaTeX d'un nombre saisi (rien pour un entier simple, inutile de le répéter). */
function apercuNombre(t: string): string | null {
  const l = saisieTrigVersLatex(t);
  return l && !/^-?[\d{},]+$/.test(l) ? l : null;
}

/** `5gen60` : fonction appliquée d'abord + valeur intermédiaire (champ), existence (choix fermé),
 * valeur exacte (champ, seulement si la composée existe : structure fixe de trois puces). */
export const DEFINITION_COMPOSEE_POINT: DefinitionEcrans<ExerciceComposeePoint, PhaseComposeePoint> = {
  phases,
  estChoix: (_e, p) => p === "existence",
  mode: (e, p) => {
    if (p === "existence") return { type: "choix", options: optionsExistence(e) };
    if (p === "inter")
      return {
        type: "champs",
        symboles: { label: "Fonction appliquée d'abord", options: SYMBOLES_FONCTION },
        champs: [{ label: `Son image de ${e.a}`.replace("-", "−"), placeholder: "ex. : 5", apercuLatex: apercuNombre }],
      };
    return {
      type: "champs",
      champs: [{ label: "Valeur exacte", labelLatex: `${composeeL(e)}=`, placeholder: "ex. : √5, 3/4 ou 2√3/3", apercuLatex: apercuNombre, raccourcis: [{ libelle: "√", texte: "√" }] }],
    };
  },
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  approchee,
  piegeChoixRevele: true,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix: (e) => (e.existe ? `La valeur intermédiaire ${e.m} appartient au domaine de ${nomExt(e)}.` : `La valeur intermédiaire ${e.m} n'appartient pas au domaine de ${nomExt(e)}.`).replace(/(\s)-(\d)/g, "$1−$2"),
  correction: correctionDetailleeComposeePoint,
};
