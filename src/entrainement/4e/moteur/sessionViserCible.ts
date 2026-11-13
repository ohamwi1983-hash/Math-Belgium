import type { ExerciceViserCible } from "../core/viserCible.types";

/**
 * Session de gen89. Écrans du sens direct : vecteur → composantes → test → conclusion ; du sens
 * inverse : vecteur → composantes → condition → m → conclusion. Choix fermés (vecteur, conclusion) :
 * UNE tentative ; champs libres : 3 tentatives. Sur l'écran « test », une colinéarité mal conclue
 * alors que le critère est juste clôt l'écran tout de suite (`clore`) : c'est un choix fermé.
 */

export type TypeEcranViserCible = "vecteur" | "composantes" | "test" | "condition" | "parametre" | "conclusion";

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export function ecransDe(e: ExerciceViserCible): TypeEcranViserCible[] {
  return e.sens === "directe" ? ["vecteur", "composantes", "test", "conclusion"] : ["vecteur", "composantes", "condition", "parametre", "conclusion"];
}

export interface EtatViserCible {
  exercice: ExerciceViserCible;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceViserCible): EtatViserCible {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function typeEcran(etat: EtatViserCible): TypeEcranViserCible {
  return ecransDe(etat.exercice)[etat.ecran]!;
}

export function tentativesMax(type: TypeEcranViserCible): number {
  return type === "vecteur" || type === "conclusion" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatViserCible, correct: boolean, clore = false): { etat: EtatViserCible; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = clore || tentativesUtilisees >= tentativesMax(typeEcran(etat));
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatViserCible): EtatViserCible {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatViserCible): EtatViserCible {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
