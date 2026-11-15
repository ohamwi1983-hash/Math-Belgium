import type { ExerciceValeurAberrante } from "../core/valeurAberrante.types";
import { ecrans } from "../ui/formatValeurAberrante";

/**
 * Session de gen110 (« Moyenne ou médiane ? La valeur aberrante ») : toujours 3 écrans (moyenne et
 * médiane ; les mêmes sans la valeur la plus éloignée ; indicateur le plus représentatif et sa
 * justification). Choix fermé : UNE tentative ; champs libres : 3 tentatives ; une saisie illisible
 * ou seulement arrondie ne consomme jamais de tentative (l'appli ne l'envoie pas ici). Aucun point.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatValeurAberrante {
  exercice: ExerciceValeurAberrante;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceValeurAberrante): EtatValeurAberrante {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(exercice: ExerciceValeurAberrante, ecran: number): number {
  return ecrans(exercice)[ecran]!.type === "verdict" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatValeurAberrante, correct: boolean): { etat: EtatValeurAberrante; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatValeurAberrante): EtatValeurAberrante {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatValeurAberrante): EtatValeurAberrante {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
