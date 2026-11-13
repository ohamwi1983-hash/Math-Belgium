import type { ExercicePortraitRobot } from "../core/portraitRobotFonction.types";

/**
 * Session de « Le portrait-robot d'une fonction » (gen71) : toujours 4 écrans, quelle que soit la
 * famille. Choix fermés (famille de référence, verdicts, courbe, condition violée) : UNE seule
 * tentative (convention du site) ; champs ouverts (translations, expression, valeurs) : 3.
 * Une saisie illisible (parse_error) ne consomme jamais de tentative — c'est l'appli qui ne
 * l'envoie pas ici.
 */

export const TENTATIVES_CHAMP = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatPortraitRobot {
  exercice: ExercicePortraitRobot;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrerPortraitRobot(exercice: ExercicePortraitRobot): EtatPortraitRobot {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

/** Écrans à choix fermé : une seule tentative. */
export function estChoixFerme(exercice: ExercicePortraitRobot, ecran: number): boolean {
  if (exercice.famille === "expression") return ecran === 0;
  if (exercice.famille === "deduction") return ecran >= 1;
  return true;
}

export function tentativesMaxEcran(exercice: ExercicePortraitRobot, ecran: number): number {
  return estChoixFerme(exercice, ecran) ? 1 : TENTATIVES_CHAMP;
}

export interface ResultatSoumission {
  etat: EtatPortraitRobot;
  /** L'écran est terminé (bonne réponse ou tentatives épuisées). */
  clos: boolean;
  revele: boolean;
}

export function soumettrePortraitRobot(etat: EtatPortraitRobot, correct: boolean): ResultatSoumission {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const suivant = { ...etat, tentativesUtilisees };
  const epuise = tentativesUtilisees >= tentativesMaxEcran(etat.exercice, etat.ecran);
  return { etat: suivant, clos: epuise, revele: epuise };
}

export function activerAidePortraitRobot(etat: EtatPortraitRobot): EtatPortraitRobot {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivantPortraitRobot(etat: EtatPortraitRobot): EtatPortraitRobot {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
