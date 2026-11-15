import type { ExerciceDetectiveStatistique } from "../core/detectiveStatistique.types";

/**
 * Session de gen112 (« Détective d'erreurs : statistique ») : toujours 3 écrans (ligne fausse, nom de l'erreur, correction). Les deux
 * premiers sont des choix fermés : UNE tentative (convention du site). La correction : 3 tentatives.
 * Une saisie illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 * Même patron que 5gen49 (`sessionDetectiveSuites.ts`).
 */

export const NOMBRE_ECRANS = 3;
export const TENTATIVES_CORRECTION = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDetectiveStatistique {
  exercice: ExerciceDetectiveStatistique;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDetectiveStatistique): EtatDetectiveStatistique {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 2 ? TENTATIVES_CORRECTION : 1;
}

export function soumettre(etat: EtatDetectiveStatistique, correct: boolean): { etat: EtatDetectiveStatistique; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDetectiveStatistique): EtatDetectiveStatistique {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDetectiveStatistique): EtatDetectiveStatistique {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
