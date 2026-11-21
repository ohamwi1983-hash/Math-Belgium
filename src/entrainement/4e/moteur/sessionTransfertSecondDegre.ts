import type { EcranTSD } from "../ui/ecransTransfertSecondDegre";

/**
 * Session commune des nouveaux générateurs du chapitre 2 de 4e (gen115, gen116, gen118, gen119,
 * gen120). Choix fermé : UNE tentative (convention du site) ; champs libres : 3 tentatives ; une
 * saisie illisible ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas ici). Aucun
 * point ni pénalité.
 */

export const TENTATIVES_CHAMPS = 3;

export interface EtatTransfert<E> {
  exercice: E;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer<E>(exercice: E): EtatTransfert<E> {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMax(ecran: EcranTSD): number {
  // Choix fermé (simple ou multiple) : une tentative ; champs : trois.
  return ecran.type === "champs" ? TENTATIVES_CHAMPS : 1;
}

export function soumettre<E>(etat: EtatTransfert<E>, ecran: EcranTSD, correct: boolean): { etat: EtatTransfert<E>; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMax(ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide<E>(etat: EtatTransfert<E>, max: number): EtatTransfert<E> {
  return { ...etat, niveauAide: Math.min(max, etat.niveauAide + 1) };
}

export function ecranSuivant<E>(etat: EtatTransfert<E>): EtatTransfert<E> {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
