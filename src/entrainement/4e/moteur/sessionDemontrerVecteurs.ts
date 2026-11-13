import type { ExerciceDemontrerVecteurs } from "../core/demontrerVecteurs.types";

/**
 * Session de gen85 : toujours 4 écrans (base, expressions, coefficient k, conclusion). Les écrans 1
 * et 4 sont des choix fermés : UNE tentative (convention du site). Les écrans 2 et 3 : 3 tentatives ;
 * une saisie illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 */

export const TENTATIVES_SAISIE = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDemontrerVecteurs {
  exercice: ExerciceDemontrerVecteurs;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDemontrerVecteurs): EtatDemontrerVecteurs {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function estChoixFerme(ecran: number): boolean {
  return ecran === 0 || ecran === 3;
}

export function tentativesMaxEcran(ecran: number): number {
  return estChoixFerme(ecran) ? 1 : TENTATIVES_SAISIE;
}

export function soumettre(etat: EtatDemontrerVecteurs, correct: boolean): { etat: EtatDemontrerVecteurs; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDemontrerVecteurs): EtatDemontrerVecteurs {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDemontrerVecteurs): EtatDemontrerVecteurs {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
