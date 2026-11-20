/**
 * Session commune de 5gen50–5gen53 : une suite d'écrans ; un choix fermé a UNE tentative, un champ
 * libre en a trois (le nombre est donné par l'appli à chaque soumission). Une saisie illisible ou
 * approchée n'arrive jamais ici (aucune tentative consommée). Deux niveaux d'aide par écran.
 */

export const TENTATIVES_CHAMP = 3;
export const TENTATIVES_CHOIX = 1;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatEcransTrig<E> {
  exercice: E;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer<E>(exercice: E): EtatEcransTrig<E> {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function soumettre<E>(etat: EtatEcransTrig<E>, correct: boolean, tentativesMax: number): { etat: EtatEcransTrig<E>; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMax;
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide<E>(etat: EtatEcransTrig<E>): EtatEcransTrig<E> {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant<E>(etat: EtatEcransTrig<E>): EtatEcransTrig<E> {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
