import type { ExerciceMethodeNombreSolutions } from "../core/methodeNombreSolutions.types";

/**
 * Session de gen113 (« Méthode et nombre de solutions ») : 2 ou 3 écrans (méthode, nombre de solutions, solutions évidentes — `nombreEcrans`). Les deux
 * premiers sont des choix fermés : UNE tentative (convention du site). La correction : 3 tentatives.
 * Une saisie illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 * Même patron que 5gen49 (`sessionDetectiveSuites.ts`).
 */


export const TENTATIVES_CORRECTION = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatMethodeNombreSolutions {
  exercice: ExerciceMethodeNombreSolutions;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceMethodeNombreSolutions): EtatMethodeNombreSolutions {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 2 ? TENTATIVES_CORRECTION : 1;
}

export function soumettre(etat: EtatMethodeNombreSolutions, correct: boolean): { etat: EtatMethodeNombreSolutions; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatMethodeNombreSolutions): EtatMethodeNombreSolutions {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatMethodeNombreSolutions): EtatMethodeNombreSolutions {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
