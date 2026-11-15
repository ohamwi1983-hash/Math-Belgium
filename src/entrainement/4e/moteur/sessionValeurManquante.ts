import type { ExerciceValeurManquante } from "../core/valeurManquante.types";
import { ecrans } from "../ui/formatValeurManquante";

/**
 * Session de gen109 : toujours 3 écrans (poser l'équation, résoudre, conclure). Choix fermé : UNE tentative (convention du site) ; champs libres :
 * 3 tentatives ; une saisie illisible ou seulement arrondie ne consomme jamais de tentative (c'est
 * l'appli qui ne l'envoie pas ici). Aucun point ni pénalité.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatValeurManquante {
  exercice: ExerciceValeurManquante;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceValeurManquante): EtatValeurManquante {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(exercice: ExerciceValeurManquante, ecran: number): number {
  return ecrans(exercice)[ecran]!.type === "choix" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatValeurManquante, correct: boolean): { etat: EtatValeurManquante; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatValeurManquante): EtatValeurManquante {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatValeurManquante): EtatValeurManquante {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
