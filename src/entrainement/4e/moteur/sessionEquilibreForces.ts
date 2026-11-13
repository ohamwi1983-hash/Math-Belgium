import type { ExerciceEquilibreForces } from "../core/equilibreForces.types";

/**
 * Session de gen90 : 4 ou 5 écrans (avec la direction). L'écran 1 (choix
 * de la condition d'équilibre) est un choix fermé : UNE tentative. Les écrans de saisie : 3 tentatives ; une saisie
 * illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 */

export const TENTATIVES_SAISIE = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatEquilibreForces {
  exercice: ExerciceEquilibreForces;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceEquilibreForces): EtatEquilibreForces {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 0 ? 1 : TENTATIVES_SAISIE;
}

export function soumettre(etat: EtatEquilibreForces, correct: boolean): { etat: EtatEquilibreForces; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatEquilibreForces): EtatEquilibreForces {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatEquilibreForces): EtatEquilibreForces {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
