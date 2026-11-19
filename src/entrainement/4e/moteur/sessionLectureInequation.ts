import type { ExerciceLectureInequation } from "../core/lectureInequationGraphique.types";

/**
 * Session de gen117 (« Lire une inéquation sur un graphique ») : 3 écrans (points communs, position, ensemble-solution). L'écran 2 (position) est un choix fermé (UNE tentative) ; les écrans 1 et 3 : 3 tentatives.
 * Une saisie illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 * Même patron que 5gen49 (`sessionDetectiveSuites.ts`).
 */

export const NOMBRE_ECRANS = 3;
export const TENTATIVES_CORRECTION = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatLectureInequation {
  exercice: ExerciceLectureInequation;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceLectureInequation): EtatLectureInequation {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 1 ? 1 : TENTATIVES_CORRECTION;
}

export function soumettre(etat: EtatLectureInequation, correct: boolean): { etat: EtatLectureInequation; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatLectureInequation): EtatLectureInequation {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatLectureInequation): EtatLectureInequation {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
