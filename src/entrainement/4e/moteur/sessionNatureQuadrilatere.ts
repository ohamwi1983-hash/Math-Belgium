import type { ExerciceNatureQuadrilatere } from "../core/natureQuadrilatere.types";

/**
 * Session de gen84 : toujours 4 écrans (parallélogramme ou quatrième sommet, côtés consécutifs,
 * angle droit, conclusion), quelle que soit la nature. Champs libres : 3 tentatives ; la conclusion
 * est un choix fermé : UNE tentative (convention du site). Une saisie illisible ne consomme jamais
 * de tentative (c'est l'appli qui ne l'envoie pas ici).
 */

export const NOMBRE_ECRANS = 4;
export const ECRAN_CONCLUSION = 3;
export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatNatureQuadrilatere {
  exercice: ExerciceNatureQuadrilatere;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceNatureQuadrilatere): EtatNatureQuadrilatere {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === ECRAN_CONCLUSION ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatNatureQuadrilatere, correct: boolean): { etat: EtatNatureQuadrilatere; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatNatureQuadrilatere): EtatNatureQuadrilatere {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatNatureQuadrilatere): EtatNatureQuadrilatere {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
