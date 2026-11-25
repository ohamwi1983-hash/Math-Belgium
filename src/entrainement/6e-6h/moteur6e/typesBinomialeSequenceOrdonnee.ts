import type { ExerciceBinomialeSequenceOrdonnee } from "../core6e/binomialeSequenceOrdonnee.types";

/**
 * Écrans de `6gen48` (6e ch. 7, § 6). A : stratégie (choix fermé SEUL sur son écran, une tentative),
 * valeurs de k, probabilités des termes, résultat (somme ou complément seulement) ; B : probabilité à
 * chaque tirage, produit. Le nombre d'écrans de A dépend de la stratégie : l'appli montre 4 puces tant
 * que la stratégie n'est pas jugée (audit, G20 : 2 ou 3 puces la révélaient).
 */
export type PhaseBinomialeSequenceOrdonnee = "aStrategie" | "aTermes" | "aValeurs" | "aResultat" | "bEcran1" | "bEcran2";

export function phasesPourExercice(e: ExerciceBinomialeSequenceOrdonnee): PhaseBinomialeSequenceOrdonnee[] {
  if (e.famille === "B") return ["bEcran1", "bEcran2"];
  return e.strategie === "termeUnique" ? ["aStrategie", "aTermes", "aValeurs"] : ["aStrategie", "aTermes", "aValeurs", "aResultat"];
}
