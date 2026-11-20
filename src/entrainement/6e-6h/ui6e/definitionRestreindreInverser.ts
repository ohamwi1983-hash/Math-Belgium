import type { ExerciceRestreindre } from "../core6e/restreindreInverser";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseRestreindre } from "./formatRestreindreInverser";
import { aide1, aide2, champs, consigne, consigneGenerale, figure, libelle, messageIllisible, phases, recap, reponse } from "./formatRestreindreInverser";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationRestreindreInverser";
import { correctionDetailleeRestreindre } from "../generateurs6e/restreindreInverser/corrigeDetaille";

/** `6gen159` sur le socle d'écrans partagé : restriction (intervalles), domaine de g ou g(y₀), puis
 * l'expression de g (aperçu KaTeX). Figure : courbe de f, x₀ marqué. */
export const DEFINITION_RESTREINDRE: DefinitionEcrans<ExerciceRestreindre, PhaseRestreindre> = {
  phases,
  estChoix: () => false,
  mode: (e, p) =>
    p === "intervalle" || p === "image"
      ? { type: "intervalles", variable: p === "intervalle" ? "x" : "y", placeholders: e.variante === "trinome" ? ["ex. : -∞ ou 2", "ex. : 3 ou +∞"] : ["ex. : π/2", "ex. : 3π/2"] }
      : { type: "champs", champs: champs(e, p) },
  libelle,
  consigneGenerale,
  figure: (e) => figure(e, "ecran"),
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeRestreindre,
};
