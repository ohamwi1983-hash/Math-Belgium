import type { ExerciceCasAmbigu } from "../core/casAmbigu.types";
import { resoudreSSA } from "./modeleCasAmbigu";

/**
 * Session de gen74 : toujours 5 écrans, quelle que soit l'issue (la barre de progression ne doit rien
 * révéler dès le départ). Écrans 1 (trancher) et 3 (nombre de triangles) : choix fermés, UNE
 * tentative. Écran 2 : champs (candidats) — ou, sans candidat (sin B̂ > 1), un choix fermé sur l'arc
 * de compas. Écrans 0 et 4 : champs, 3 tentatives. Une saisie illisible ne consomme jamais de
 * tentative (c'est l'appli qui ne l'envoie pas ici).
 */

export const NOMBRE_ECRANS = 5;
export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatCasAmbigu {
  exercice: ExerciceCasAmbigu;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceCasAmbigu): EtatCasAmbigu {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

/** Écran à choix fermé (une tentative) ? */
export function ecranFerme(exercice: ExerciceCasAmbigu, ecran: number): boolean {
  if (ecran === 1 || ecran === 3) return true;
  return ecran === 2 && resoudreSSA(exercice).candidats.length === 0;
}

export function tentativesMaxEcran(exercice: ExerciceCasAmbigu, ecran: number): number {
  return ecranFerme(exercice, ecran) ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatCasAmbigu, correct: boolean): { etat: EtatCasAmbigu; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatCasAmbigu): EtatCasAmbigu {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatCasAmbigu): EtatCasAmbigu {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
