import type { ExerciceDetectiveLogarithmes } from "../core6e/detectiveLogarithmes.types";

/**
 * Session de 6gen88 : toujours 3 écrans (ligne fausse, nom de l'erreur, correction). Les deux
 * premiers sont des choix fermés : UNE tentative (convention du site). La correction : 3 tentatives.
 * Une saisie illisible ou approchée ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 * Même patron que 6gen84 (`sessionDetectiveIntegrales.ts`).
 */

export const NOMBRE_ECRANS = 3;
export const TENTATIVES_CORRECTION = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDetectiveLogarithmes {
  exercice: ExerciceDetectiveLogarithmes;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDetectiveLogarithmes): EtatDetectiveLogarithmes {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 2 ? TENTATIVES_CORRECTION : 1;
}

export function soumettre(etat: EtatDetectiveLogarithmes, correct: boolean): { etat: EtatDetectiveLogarithmes; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDetectiveLogarithmes): EtatDetectiveLogarithmes {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDetectiveLogarithmes): EtatDetectiveLogarithmes {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
