import type { ExerciceTexteTriangle } from "../core/texteTriangle.types";
import { estChoixFerme, sequenceEcrans, type TypeEcran } from "./modeleTexteTriangle";

/**
 * Session de gen77 : toujours 5 écrans. Choix fermés (identifier, loi, réponse, configuration,
 * trancher) : UNE tentative ; champs numériques (convertir, calculer, candidats, distances) : 3
 * tentatives. Une saisie illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici).
 * Aucun point ni pénalité.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatTexteTriangle {
  exercice: ExerciceTexteTriangle;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceTexteTriangle): EtatTexteTriangle {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function typeEcran(etat: EtatTexteTriangle): TypeEcran {
  return sequenceEcrans(etat.exercice)[etat.ecran]!;
}

export function tentativesMax(type: TypeEcran): number {
  return estChoixFerme(type) ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatTexteTriangle, correct: boolean): { etat: EtatTexteTriangle; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMax(typeEcran(etat));
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatTexteTriangle): EtatTexteTriangle {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatTexteTriangle): EtatTexteTriangle {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
