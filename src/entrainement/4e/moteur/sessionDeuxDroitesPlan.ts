import type { ExerciceDeuxDroitesPlan } from "../core/deuxDroitesPlan.types";
import { ecrans } from "../ui/formatDeuxDroitesPlan";

/**
 * Session de gen100 (« Positions de deux droites et plan déterminé ») : 3 écrans pour deux droites
 * (plan commun, position, justification), 2 pour « plan déterminé » (oui/non, puis nom du plan ou
 * raison). Choix fermé : UNE tentative ; nom du plan (saisie libre) : 3 tentatives ; une saisie
 * illisible ne consomme jamais de tentative (l'appli ne l'envoie pas ici). Aucun point affiché.
 */

export const TENTATIVES_SAISIE = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatDeuxDroitesPlan {
  exercice: ExerciceDeuxDroitesPlan;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDeuxDroitesPlan): EtatDeuxDroitesPlan {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(exercice: ExerciceDeuxDroitesPlan, ecran: number): number {
  return ecrans(exercice)[ecran]!.type === "choix" ? 1 : TENTATIVES_SAISIE;
}

export function soumettre(etat: EtatDeuxDroitesPlan, correct: boolean): { etat: EtatDeuxDroitesPlan; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatDeuxDroitesPlan): EtatDeuxDroitesPlan {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDeuxDroitesPlan): EtatDeuxDroitesPlan {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
