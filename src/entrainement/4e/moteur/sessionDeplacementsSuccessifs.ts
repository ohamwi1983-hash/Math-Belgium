import type { ExerciceDeplacementsSuccessifs } from "../core/deplacementsSuccessifs.types";

/**
 * Session de gen86 : 4 ou 5 écrans, tous à champs ouverts (composantes, nombre, distance) : 3
 * tentatives par écran. Une saisie illisible ne consomme jamais de tentative (c'est l'appli qui ne
 * l'envoie pas ici). Aucun point affiché.
 */

export const TENTATIVES_MAX = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDeplacementsSuccessifs {
  exercice: ExerciceDeplacementsSuccessifs;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDeplacementsSuccessifs): EtatDeplacementsSuccessifs {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function soumettre(etat: EtatDeplacementsSuccessifs, correct: boolean): { etat: EtatDeplacementsSuccessifs; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= TENTATIVES_MAX;
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDeplacementsSuccessifs): EtatDeplacementsSuccessifs {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDeplacementsSuccessifs): EtatDeplacementsSuccessifs {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
