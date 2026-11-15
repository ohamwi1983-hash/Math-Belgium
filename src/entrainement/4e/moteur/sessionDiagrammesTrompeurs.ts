import type { ExerciceDiagrammesTrompeurs } from "../core/diagrammesTrompeurs.types";
import { ecransExercice } from "../ui/formatDiagrammesTrompeurs";

/**
 * Session de gen111 (« Diagrammes et graphiques trompeurs ») : 2 ou 3 écrans selon le sous-type
 * (`ui/formatDiagrammesTrompeurs.ts::ecransExercice`). Un choix fermé (la manipulation) : UNE
 * tentative ; des champs : 3 tentatives. Une saisie illisible ne consomme jamais de tentative
 * (l'appli ne l'envoie pas ici). Aucun point affiché.
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDiagrammesTrompeurs {
  exercice: ExerciceDiagrammesTrompeurs;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDiagrammesTrompeurs): EtatDiagrammesTrompeurs {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function nombreEcrans(exercice: ExerciceDiagrammesTrompeurs): number {
  return ecransExercice(exercice).length;
}

export function tentativesMaxEcran(etat: EtatDiagrammesTrompeurs): number {
  return ecransExercice(etat.exercice)[etat.ecran]!.genre === "choix" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatDiagrammesTrompeurs, correct: boolean): { etat: EtatDiagrammesTrompeurs; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDiagrammesTrompeurs): EtatDiagrammesTrompeurs {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDiagrammesTrompeurs): EtatDiagrammesTrompeurs {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
