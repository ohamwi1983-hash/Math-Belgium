import type { ExerciceDecompositionVecteur } from "../core/decompositionVecteur.types";

/**
 * Session de gen82. L'écran 0 est toujours un choix fermé (point M, système ou verdict) : UNE
 * tentative (convention du site). Les écrans suivants sont des champs libres : 3 tentatives ; une
 * saisie illisible ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas ici).
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDecompositionVecteur {
  exercice: ExerciceDecompositionVecteur;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDecompositionVecteur): EtatDecompositionVecteur {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 0 ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatDecompositionVecteur, correct: boolean): { etat: EtatDecompositionVecteur; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDecompositionVecteur): EtatDecompositionVecteur {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDecompositionVecteur): EtatDecompositionVecteur {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
