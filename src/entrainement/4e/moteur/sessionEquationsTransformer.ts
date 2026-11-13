import type { ExerciceEquationsTransformer } from "../core/equationsTransformer.types";

/**
 * Session de gen78 : suite d'écrans calculée depuis l'exercice (`ecransDe`). Champs libres :
 * 3 tentatives ; un mauvais VERDICT (choix fermé « pas de solution / au moins une ») clôt l'écran
 * aussitôt (une seule tentative, réponse révélée). Aucun point affiché.
 */

export const TENTATIVES_MAX = 3;

export interface EtatEquationsTransformer {
  exercice: ExerciceEquationsTransformer;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceEquationsTransformer): EtatEquationsTransformer {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function soumettre(etat: EtatEquationsTransformer, correct: boolean, verdictFaux: boolean): { etat: EtatEquationsTransformer; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = verdictFaux || tentativesUtilisees >= TENTATIVES_MAX;
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatEquationsTransformer, niveauMax: number): EtatEquationsTransformer {
  return { ...etat, niveauAide: Math.min(niveauMax, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatEquationsTransformer): EtatEquationsTransformer {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
