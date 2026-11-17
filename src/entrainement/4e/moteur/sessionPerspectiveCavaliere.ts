import type { ExercicePerspectiveCavaliere } from "../core/perspectiveCavaliere.types";

/**
 * Moteur de session de gen104 (« Dessiner en perspective cavalière ») : écran courant, tentatives,
 * niveau d'aide et sommets acquis (dessinés à leur place exacte). Aucun point ni pénalité.
 * Écrans 1 et 2 (placement libre, comme un champ ouvert) : 3 tentatives ; écran 3 (classer les
 * arêtes, choix fermé) : UNE tentative.
 */

export const TENTATIVES_PLACEMENT = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatPerspectiveCavaliere {
  exercice: ExercicePerspectiveCavaliere;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
  /** Sommets dessinés à leur place exacte. */
  connus: string[];
}

export function demarrer(exercice: ExercicePerspectiveCavaliere): EtatPerspectiveCavaliere {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0, connus: exercice.sommets.filter((s) => s.donne).map((s) => s.nom) };
}

export function tentativesMax(ecran: number): number {
  return ecran < 2 ? TENTATIVES_PLACEMENT : 1;
}

/** Sommets à placer à l'écran `ecran` (vide à l'écran 3). */
export function aPlacer(e: ExercicePerspectiveCavaliere, ecran: number): string[] {
  if (ecran === 0) return [e.premier];
  if (ecran === 1) return e.suivants;
  return [];
}

/** Ajoute des sommets acquis (validés, révélés, ou complétés). */
export function acquerir(etat: EtatPerspectiveCavaliere, noms: readonly string[]): EtatPerspectiveCavaliere {
  return { ...etat, connus: [...etat.connus, ...noms.filter((n) => !etat.connus.includes(n))] };
}

export function echec(etat: EtatPerspectiveCavaliere): { etat: EtatPerspectiveCavaliere; epuise: boolean } {
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  return { etat: { ...etat, tentativesUtilisees }, epuise: tentativesUtilisees >= tentativesMax(etat.ecran) };
}

export function activerAide(etat: EtatPerspectiveCavaliere): EtatPerspectiveCavaliere {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

/** Écran suivant ; après l'écran 1, la pyramide reçoit son quatrième sommet de base (même fuyante). */
export function ecranSuivant(etat: EtatPerspectiveCavaliere): EtatPerspectiveCavaliere {
  const suivant = { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
  return etat.ecran === 0 ? acquerir(suivant, etat.exercice.completes) : suivant;
}
