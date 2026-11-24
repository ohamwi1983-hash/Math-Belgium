/**
 * Retours de saisie communs du 5e ch. 5 (5gen25–5gen35, lot B — règles communes, modèle du 5e ch. 4) :
 * messages d'illisible PAR NATURE de champ (toujours « … ne compte pas comme une tentative »), message
 * de valeur approchée, conversion des aides historiques (texte + LaTeX) vers les aides à deux niveaux
 * du 5e (`AideTrig` : une phrase terminée par « : », puis la formule en KaTeX — jamais la réponse).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { AideTrig } from "./aidesTrigonometrie";

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { MESSAGES_ILLISIBLE_DERIVEES } from "../moteur5e/saisieDerivees";
export type { ChampDerivees } from "../moteur5e/saisieDerivees";

/** Texte « riche » (`$…$` = KaTeX) → fragments. */
export function fragmentsRiches5e(texte: string): FragmentConsigne[] {
  return texte
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? l(morceau) : t(morceau)))
    .filter((f) => f.valeur !== "");
}

/** Aide historique (texte, puis formule LaTeX facultative) → niveau d'aide du 5e. */
export function aideDepuis(texte: string, latex?: string | null): AideTrig {
  return { texte: fragmentsRiches5e(texte), formules: latex ? [latex] : [] };
}

/** Message affiché sous la réponse révélée d'un choix fermé (une seule tentative). */
export const PREFIXE_CHOIX_FERME = "Ce n'était pas le bon choix (choix fermé : une seule tentative).";
