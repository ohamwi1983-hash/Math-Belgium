import type { ExerciceConstruireSomme } from "../core/construireSomme.types";
import { ecrans } from "./modeleConstruireSomme";

/**
 * Session de gen83 : un écran par étape de la construction (`ecrans`). Une construction ou une
 * lecture de composantes est un champ ouvert : 3 tentatives. Le retournement de la relation
 * (variante point « MA ») est un choix fermé : UNE tentative (convention du site).
 */

export const TENTATIVES_CHAMP_OUVERT = 3;

export interface EtatConstruireSomme {
  exercice: ExerciceConstruireSomme;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceConstruireSomme): EtatConstruireSomme {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function nombreEcrans(exercice: ExerciceConstruireSomme): number {
  return ecrans(exercice).length;
}

export function tentativesMaxEcran(exercice: ExerciceConstruireSomme, ecran: number): number {
  return ecrans(exercice)[ecran]?.type === "choix" ? 1 : TENTATIVES_CHAMP_OUVERT;
}

export function soumettre(etat: EtatConstruireSomme, correct: boolean): { etat: EtatConstruireSomme; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatConstruireSomme, niveauMax: number): EtatConstruireSomme {
  return { ...etat, niveauAide: Math.min(niveauMax, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatConstruireSomme): EtatConstruireSomme {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
