import type { ExerciceDetectiveVecteurs } from "../core/detectiveVecteurs.types";

/**
 * Session de gen91 : toujours 3 écrans (ligne fausse, nom de l'erreur, correction). Les deux
 * premiers sont des choix fermés : UNE tentative (convention du site). La correction : 3 tentatives
 * pour les champs ; le verdict éventuel est un choix fermé, jugé à la PREMIÈRE validation (un
 * verdict faux clôt l'écran, un verdict juste reste figé pendant les essais suivants). Une saisie
 * illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 */

export const NOMBRE_ECRANS = 3;
export const TENTATIVES_CORRECTION = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDetectiveVecteurs {
  exercice: ExerciceDetectiveVecteurs;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDetectiveVecteurs): EtatDetectiveVecteurs {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 2 ? TENTATIVES_CORRECTION : 1;
}

/** `definitif` : échec sans nouvel essai possible (verdict faux à l'écran 3). */
export function soumettre(etat: EtatDetectiveVecteurs, correct: boolean, definitif = false): { etat: EtatDetectiveVecteurs; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = definitif || tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDetectiveVecteurs): EtatDetectiveVecteurs {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDetectiveVecteurs): EtatDetectiveVecteurs {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
