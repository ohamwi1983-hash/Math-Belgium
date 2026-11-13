import type { ExerciceRotationsContexte } from "../core/rotationsContexte.types";

/**
 * Session de gen79 : toujours 4 écrans (repérage, puis trois écrans de calcul). Le repérage est un
 * choix fermé : UNE tentative (convention du site). Les écrans numériques : 3 tentatives ; une
 * saisie illisible ou un angle non réduit ne consomme jamais de tentative (c'est l'appli qui ne
 * l'envoie pas ici). Aucun point, aucune pénalité.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatRotationsContexte {
  exercice: ExerciceRotationsContexte;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceRotationsContexte): EtatRotationsContexte {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 0 ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatRotationsContexte, correct: boolean): { etat: EtatRotationsContexte; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatRotationsContexte): EtatRotationsContexte {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatRotationsContexte): EtatRotationsContexte {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
