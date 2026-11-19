import type { ExerciceSigneRacines } from "../core/signeRacines.types";
import { phases } from "./modeleSigneRacines";

/**
 * Session de gen114 (« Signe des racines sans les calculer ») : écrans de `phases` (2 à 4). Champs
 * (P, Δ, S, x₁, x₂) : 3 tentatives ; verdict (choix fermé) : UNE tentative. Une saisie illisible ne
 * consomme jamais de tentative (l'appli ne l'envoie pas ici).
 */

export const TENTATIVES_CHAMP = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatSigneRacines {
  exercice: ExerciceSigneRacines;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceSigneRacines): EtatSigneRacines {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(etat: EtatSigneRacines): number {
  return phases(etat.exercice)[etat.ecran] === "verdict" ? 1 : TENTATIVES_CHAMP;
}

export function soumettre(etat: EtatSigneRacines, correct: boolean): { etat: EtatSigneRacines; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatSigneRacines): EtatSigneRacines {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatSigneRacines): EtatSigneRacines {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
