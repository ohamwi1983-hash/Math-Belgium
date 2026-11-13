import type { ExerciceChantierTerrains } from "../core/chantierTerrains.types";
import { ecrans } from "../ui/formatChantierTerrains";

/**
 * Session de gen88 : toujours 4 écrans (outil, vecteurs, critère, réponse). Choix fermé : UNE
 * tentative (convention du site) ; champs libres : 3 tentatives ; une saisie illisible ne consomme
 * jamais de tentative (c'est l'appli qui ne l'envoie pas ici).
 */

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatChantierTerrains {
  exercice: ExerciceChantierTerrains;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceChantierTerrains): EtatChantierTerrains {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function tentativesMaxEcran(exercice: ExerciceChantierTerrains, ecran: number): number {
  return ecrans(exercice)[ecran]!.type === "choix" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatChantierTerrains, correct: boolean): { etat: EtatChantierTerrains; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatChantierTerrains): EtatChantierTerrains {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatChantierTerrains): EtatChantierTerrains {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
