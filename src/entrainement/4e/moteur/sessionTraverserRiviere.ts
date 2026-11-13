import type { ExerciceTraverserRiviere } from "../core/traverserRiviere.types";

/**
 * Session de gen87 : 4 écrans (où accoste-t-il ?) ou 3 (quelle direction pour arriver juste en
 * face ?), tous des champs ouverts : 3 tentatives ; une saisie illisible ne consomme jamais de
 * tentative (l'appli ne l'envoie pas ici). Aucun point affiché.
 */

export const TENTATIVES_SAISIE = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatTraverserRiviere {
  exercice: ExerciceTraverserRiviere;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceTraverserRiviere): EtatTraverserRiviere {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function soumettre(etat: EtatTraverserRiviere, correct: boolean): { etat: EtatTraverserRiviere; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= TENTATIVES_SAISIE;
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatTraverserRiviere): EtatTraverserRiviere {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatTraverserRiviere): EtatTraverserRiviere {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
