import type { ExerciceDetectiveFonction } from "../core/detectiveFonction.types";

/**
 * Session de gen127 (même patron que gen121, `sessionDetectiveSecondDegre.ts`) : 3 écrans ; les deux
 * premiers sont des choix fermés (UNE tentative), la correction a 3 tentatives. Une saisie illisible
 * ne consomme jamais de tentative (l'appli ne l'envoie pas ici). Aucun point.
 */

export const NOMBRE_ECRANS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDetectiveFonction {
  exercice: ExerciceDetectiveFonction;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDetectiveFonction): EtatDetectiveFonction {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 2 ? 3 : 1;
}

export function soumettre(etat: EtatDetectiveFonction, correct: boolean): { etat: EtatDetectiveFonction; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDetectiveFonction): EtatDetectiveFonction {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDetectiveFonction): EtatDetectiveFonction {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
