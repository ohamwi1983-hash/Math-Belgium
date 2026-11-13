import type { ExerciceAireTriangleSinus } from "../core/aireTriangleSinus.types";
import { etapes, type EtapeAireTriangle } from "./modeleAireTriangleSinus";

/**
 * Session de gen75 : 2 ou 3 écrans selon la famille (`etapes`). Choix fermés (formule, nombre
 * d'amplitudes) : UNE tentative ; champs numériques : 3 tentatives ; une saisie illisible ne
 * consomme jamais de tentative (c'est l'appli qui ne l'envoie pas ici). Aucun point.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatAireTriangleSinus {
  exercice: ExerciceAireTriangleSinus;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceAireTriangleSinus): EtatAireTriangleSinus {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function estChoixFerme(etape: EtapeAireTriangle): boolean {
  return etape === "formuleAire" || etape === "formuleCote" || etape === "nombreAngles";
}

export function etapeCourante(etat: EtatAireTriangleSinus): EtapeAireTriangle {
  return etapes(etat.exercice)[etat.ecran]!;
}

export function tentativesMax(etape: EtapeAireTriangle): number {
  return estChoixFerme(etape) ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatAireTriangleSinus, correct: boolean): { etat: EtatAireTriangleSinus; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMax(etapeCourante(etat));
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatAireTriangleSinus): EtatAireTriangleSinus {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatAireTriangleSinus): EtatAireTriangleSinus {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
