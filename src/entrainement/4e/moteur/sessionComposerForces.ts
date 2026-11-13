import type { ExerciceComposerForces } from "../core/composerForces.types";

/**
 * Session de gen80 : 3 écrans (intensité seule) ou 4 (intensité + direction, cap). L'écran 1 (choix
 * du triangle) est un choix fermé : UNE tentative. Les écrans de saisie : 3 tentatives ; une saisie
 * illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 */

export const TENTATIVES_SAISIE = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatComposerForces {
  exercice: ExerciceComposerForces;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceComposerForces): EtatComposerForces {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 0 ? 1 : TENTATIVES_SAISIE;
}

export function soumettre(etat: EtatComposerForces, correct: boolean): { etat: EtatComposerForces; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatComposerForces): EtatComposerForces {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatComposerForces): EtatComposerForces {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
