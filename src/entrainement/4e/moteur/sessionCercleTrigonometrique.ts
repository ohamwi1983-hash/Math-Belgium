/**
 * Couche B — moteur de session pour "Placement et lecture sur le cercle trigonométrique"
 * (chapitre 3, premier exercice). N'importe jamais rien de src/generateurs — voir
 * sessionCercleTrigonometrique.test.ts pour la preuve avec un générateur factice, même principe
 * que les treize autres moteurs du projet.
 *
 * 4 phases, toujours dans le même ordre, une seule conditionnellement absente :
 * [reduction] → quadrant → anglePremierQuadrant → signes.
 * "reduction" n'a lieu que si l'angle de l'énoncé n'est pas déjà dans [0°,360°[
 * (necessiteReduction) — la séquence démarre directement sur "reduction" ou "quadrant" selon le
 * cas, aucun écran "énoncé" séparé (correction 1, promptcorrectionsgenerateurcercletrigo1.md :
 * l'écran "énoncé" seul, sans question, a été supprimé — le bloc affichant l'angle reste visible
 * sur tous les écrans restants, porté par chaque composant d'étape, pas par une phase dédiée).
 */
import type { ExerciceCercleTrigonometrique, GenerateurExerciceCercleTrigonometrique, Quadrant, ReponseSignes } from "../core/cercleTrigonometrique.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { necessiteReduction, verifierAnglePremierQuadrant, verifierQuadrant, verifierReduction, verifierSignes } from "./verificationCercleTrigonometrique";
import type { EtatSessionCercleTrigonometrique, PhaseCercleTrigonometrique, ResultatExerciceCercleTrigonometrique } from "./typesCercleTrigonometrique";

const POINTS_DE_BASE = 100;

/** Première phase de la séquence pour cet exercice — "reduction" si nécessaire, "quadrant" sinon. */
function phaseInitiale(exercice: ExerciceCercleTrigonometrique): PhaseCercleTrigonometrique {
  return necessiteReduction(exercice) ? "reduction" : "quadrant";
}

export function demarrerSessionCercleTrigonometrique(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceCercleTrigonometrique,
): EtatSessionCercleTrigonometrique {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    aideReductionUtilisee: false,
    aideAnglePremierQuadrantUtilisee: false,
    aideSignesUtilisee: false,
    scoreReductionExercice: null,
    reductionRevele: false,
    scoreQuadrantExercice: null,
    quadrantRevele: false,
    scoreAnglePremierQuadrantExercice: null,
    anglePremierQuadrantRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionCercleTrigonometrique): ReglagesEtape {
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
 * Bouton "Aide" : un bouton par écran (jamais sur "Quadrant", qui n'en a pas), révélation à sens
 * unique — active uniquement le flag correspondant à `etat.phase`, sans jamais affecter les autres
 * écrans de l'exercice (promptcorrectionsgenerateur14lot2.md, section 1).
 */
export function activerAide(etat: EtatSessionCercleTrigonometrique): EtatSessionCercleTrigonometrique {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  switch (etat.phase) {
    case "reduction":
      return { ...etat, aideReductionUtilisee: true };
    case "anglePremierQuadrant":
      return { ...etat, aideAnglePremierQuadrantUtilisee: true };
    case "signes":
      return { ...etat, aideSignesUtilisee: true };
    case "quadrant":
      throw new Error("activerAide : l'écran Quadrant n'a pas de bouton Aide");
  }
}

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionCercleTrigonometrique,
  resultat: ResultatExerciceCercleTrigonometrique,
): EtatSessionCercleTrigonometrique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const prochainExercice = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: prochainExercice,
    phase: phaseInitiale(prochainExercice),
    etapeCourante: demarrerEtapeTentatives(),
    aideReductionUtilisee: false,
    aideAnglePremierQuadrantUtilisee: false,
    aideSignesUtilisee: false,
    scoreReductionExercice: null,
    reductionRevele: false,
    scoreQuadrantExercice: null,
    quadrantRevele: false,
    scoreAnglePremierQuadrantExercice: null,
    anglePremierQuadrantRevele: false,
  };
}

/** Premier écran de la séquence si nécessiteReduction(exercice) : valeur numérique simple. */
export function soumettreReponseReduction(etat: EtatSessionCercleTrigonometrique, valeur: number): EtatSessionCercleTrigonometrique {
  if (etat.terminee || etat.phase !== "reduction") {
    throw new Error("soumettreReponseReduction : la session n'est pas à l'étape réduction");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierReduction(etat.exerciceCourant, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideReductionUtilisee);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "quadrant",
    scoreReductionExercice: score,
    reductionRevele: etapeCourante.revelee,
  };
}

/** Sélection sur le cercle interactif (quadrant ou axe), toujours présente. */
export function soumettreReponseQuadrant(etat: EtatSessionCercleTrigonometrique, reponse: Quadrant): EtatSessionCercleTrigonometrique {
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

  // Aucun bouton "Aide" sur cet écran (section 1, promptcorrectionsgenerateurcercletrigo1.md,
  // correction 3) : le score n'est donc jamais pénalisé ici.
  const score = etapeCourante.score as number;
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "anglePremierQuadrant",
    scoreQuadrantExercice: score,
    quadrantRevele: etapeCourante.revelee,
  };
}

/** Angle du premier quadrant : valeur numérique entre 0 et 90, toujours présente. */
export function soumettreReponseAnglePremierQuadrant(
  etat: EtatSessionCercleTrigonometrique,
  valeur: number,
): EtatSessionCercleTrigonometrique {
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
    phase: "signes",
    scoreAnglePremierQuadrantExercice: score,
    anglePremierQuadrantRevele: etapeCourante.revelee,
  };
}

/** Signes de sin/cos/tan, dernière phase : les 3 colonnes du tableau en un seul essai global. */
export function soumettreReponseSignes(etat: EtatSessionCercleTrigonometrique, reponse: ReponseSignes): EtatSessionCercleTrigonometrique {
  if (etat.terminee || etat.phase !== "signes") {
    throw new Error("soumettreReponseSignes : la session n'est pas à l'étape signes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSignes>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSignes(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideSignesUtilisee);
  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    scoreReduction: etat.scoreReductionExercice,
    reductionRevele: etat.reductionRevele,
    reductionAideUtilisee: etat.aideReductionUtilisee,
    scoreQuadrant: etat.scoreQuadrantExercice as number,
    quadrantRevele: etat.quadrantRevele,
    scoreAnglePremierQuadrant: etat.scoreAnglePremierQuadrantExercice as number,
    anglePremierQuadrantRevele: etat.anglePremierQuadrantRevele,
    anglePremierQuadrantAideUtilisee: etat.aideAnglePremierQuadrantUtilisee,
    scoreSignes: score,
    signesRevele: etapeCourante.revelee,
    signesAideUtilisee: etat.aideSignesUtilisee,
  });
}
