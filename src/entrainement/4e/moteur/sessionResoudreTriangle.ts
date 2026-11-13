import type { ExerciceResoudreTriangle } from "../core/resoudreTriangle.types";

/**
 * Session de gen73 : 4 écrans fixes (configuration, première loi, calculs, contrôle). Les deux
 * choix fermés : UNE tentative (convention du site). Les écrans à champs : 3 tentatives ; une saisie
 * illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici). Aucun point.
 */

export const NOMBRE_ECRANS = 4;
export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatResoudreTriangle {
  exercice: ExerciceResoudreTriangle;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceResoudreTriangle): EtatResoudreTriangle {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(ecran: number): number {
  return ecran <= 1 ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatResoudreTriangle, correct: boolean): { etat: EtatResoudreTriangle; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatResoudreTriangle): EtatResoudreTriangle {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatResoudreTriangle): EtatResoudreTriangle {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
