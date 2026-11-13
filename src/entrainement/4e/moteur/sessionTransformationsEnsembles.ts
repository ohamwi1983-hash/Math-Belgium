import type { ExerciceTransformationsEnsembles } from "../core/transformationsEnsembles.types";

/**
 * Session de gen72 : toujours 3 écrans (classement, domaine, ensemble image). Le classement est un
 * choix fermé : UNE tentative (convention du site). Les écrans d'intervalles : 3 tentatives ; une
 * borne illisible ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas ici).
 */

export const TENTATIVES_INTERVALLES = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatTransformationsEnsembles {
  exercice: ExerciceTransformationsEnsembles;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceTransformationsEnsembles): EtatTransformationsEnsembles {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran === 0 ? 1 : TENTATIVES_INTERVALLES;
}

export function soumettre(etat: EtatTransformationsEnsembles, correct: boolean): { etat: EtatTransformationsEnsembles; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatTransformationsEnsembles): EtatTransformationsEnsembles {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatTransformationsEnsembles): EtatTransformationsEnsembles {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
