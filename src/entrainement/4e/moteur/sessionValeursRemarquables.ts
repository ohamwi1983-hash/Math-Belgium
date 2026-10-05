/**
 * Couche B — moteur de session pour "Valeurs remarquables" (chapitre 3, deuxième exercice).
 * N'importe jamais rien de src/generateurs — voir sessionValeursRemarquables.test.ts pour la
 * preuve avec un générateur factice, même principe que les treize autres moteurs du projet.
 *
 * 3 phases fixes, toujours dans le même ordre, aucun saut conditionnel :
 * quadrant → anglePremierQuadrant → valeursExactes.
 */
import type { GenerateurExerciceValeursRemarquables, ReponseValeursExactes } from "../core/valeursRemarquables.types";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierAnglePremierQuadrant, verifierQuadrant, verifierValeursExactes } from "./verificationValeursRemarquables";
import type { EtatSessionValeursRemarquables, ResultatExerciceValeursRemarquables } from "./typesValeursRemarquables";

const POINTS_DE_BASE = 100;

export function demarrerSessionValeursRemarquables(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceValeursRemarquables,
): EtatSessionValeursRemarquables {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "quadrant",
    etapeCourante: demarrerEtapeTentatives(),
    aideQuadrantUtilisee: false,
    aideAnglePremierQuadrantUtilisee: false,
    aideValeursExactesUtilisee: false,
    scoreQuadrantExercice: null,
    quadrantRevele: false,
    scoreAnglePremierQuadrantExercice: null,
    anglePremierQuadrantRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionValeursRemarquables): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteAide(score: number, aideUtilisee: boolean): number {
  return aideUtilisee ? score * 0.5 : score;
}

/**
 * Bouton "Aide" : un bouton par écran (les 3 écrans en ont un — contrairement au premier générateur
 * du chapitre, où "Quadrant" n'en a pas), révélation à sens unique — active uniquement le flag
 * correspondant à `etat.phase`, sans jamais affecter les autres écrans (`promptcreationgenerateur15.md`).
 */
export function activerAide(etat: EtatSessionValeursRemarquables): EtatSessionValeursRemarquables {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  switch (etat.phase) {
    case "quadrant":
      return { ...etat, aideQuadrantUtilisee: true };
    case "anglePremierQuadrant":
      return { ...etat, aideAnglePremierQuadrantUtilisee: true };
    case "valeursExactes":
      return { ...etat, aideValeursExactesUtilisee: true };
  }
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionValeursRemarquables,
  resultat: ResultatExerciceValeursRemarquables,
): EtatSessionValeursRemarquables {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    phase: "quadrant",
    etapeCourante: demarrerEtapeTentatives(),
    aideQuadrantUtilisee: false,
    aideAnglePremierQuadrantUtilisee: false,
    aideValeursExactesUtilisee: false,
    scoreQuadrantExercice: null,
    quadrantRevele: false,
    scoreAnglePremierQuadrantExercice: null,
    anglePremierQuadrantRevele: false,
  };
}

export function soumettreReponseQuadrant(etat: EtatSessionValeursRemarquables, reponse: Quadrant): EtatSessionValeursRemarquables {
  if (etat.terminee || etat.phase !== "quadrant") {
    throw new Error("soumettreReponseQuadrant : la session n'est pas à l'étape quadrant");
  }

  const etapeCourante = soumettreEtapeTentatives<Quadrant>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierQuadrant(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideQuadrantUtilisee);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "anglePremierQuadrant",
    scoreQuadrantExercice: score,
    quadrantRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseAnglePremierQuadrant(
  etat: EtatSessionValeursRemarquables,
  valeur: number,
): EtatSessionValeursRemarquables {
  if (etat.terminee || etat.phase !== "anglePremierQuadrant") {
    throw new Error("soumettreReponseAnglePremierQuadrant : la session n'est pas à l'étape angle du premier quadrant");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierAnglePremierQuadrant(etat.exerciceCourant, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideAnglePremierQuadrantUtilisee);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "valeursExactes",
    scoreAnglePremierQuadrantExercice: score,
    anglePremierQuadrantRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice : sin/cos/tan en un seul essai global (tout ou rien). */
export function soumettreReponseValeursExactes(
  etat: EtatSessionValeursRemarquables,
  reponse: ReponseValeursExactes,
): EtatSessionValeursRemarquables {
  if (etat.terminee || etat.phase !== "valeursExactes") {
    throw new Error("soumettreReponseValeursExactes : la session n'est pas à l'étape valeurs exactes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseValeursExactes>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValeursExactes(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideValeursExactesUtilisee);
  return cloturerExerciceOuSuivant(etat, {
    anglePremierQuadrant: etat.exerciceCourant.anglePremierQuadrant,
    scoreQuadrant: etat.scoreQuadrantExercice as number,
    quadrantRevele: etat.quadrantRevele,
    quadrantAideUtilisee: etat.aideQuadrantUtilisee,
    scoreAnglePremierQuadrant: etat.scoreAnglePremierQuadrantExercice as number,
    anglePremierQuadrantRevele: etat.anglePremierQuadrantRevele,
    anglePremierQuadrantAideUtilisee: etat.aideAnglePremierQuadrantUtilisee,
    scoreValeursExactes: score,
    valeursExactesRevele: etapeCourante.revelee,
    valeursExactesAideUtilisee: etat.aideValeursExactesUtilisee,
  });
}
