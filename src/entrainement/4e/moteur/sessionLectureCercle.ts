import type { ExerciceLectureCercle } from "../core/lectureCercle.types";

/**
 * Session de gen122 « Lire sur le cercle trigonométrique » : trois écrans de champs (cos θ et
 * sin θ ; θ ; tan θ ou le verdict « n'est pas définie »), 3 tentatives chacun. Une saisie illisible,
 * approchée ou recopiée (sin/cos/tan tapé) ne consomme JAMAIS de tentative : l'appli ne l'envoie
 * pas ici. Aides à deux niveaux (le niveau sert au drapeau « aide utilisée » des puces). Aucun point
 * ni pénalité.
 */

export const NOMBRE_ECRANS = 3;
export const TENTATIVES_CHAMPS = 3;

export interface EtatLectureCercle {
  exercice: ExerciceLectureCercle;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceLectureCercle): EtatLectureCercle {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function soumettre(etat: EtatLectureCercle, correct: boolean): { etat: EtatLectureCercle; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= TENTATIVES_CHAMPS;
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatLectureCercle, max: number): EtatLectureCercle {
  return { ...etat, niveauAide: Math.min(max, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatLectureCercle): EtatLectureCercle {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
