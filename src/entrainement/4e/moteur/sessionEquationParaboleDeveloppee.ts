/**
 * Couche B — moteur de session pour "Sommet, foyer, p et directrice d'une parabole depuis
 * l'équation développée". N'importe jamais rien de `src/generateurs/` — voir
 * `sessionEquationParaboleDeveloppee.test.ts` pour la preuve avec un générateur factice.
 *
 * 3 phases FIXES, toujours dans le même ordre : `regroupement → completion → caracteristiques` —
 * aucun saut conditionnel, les deux variantes traversant exactement la même séquence (même
 * principe que "Centre et rayon d'un cercle depuis l'équation développée"). "caracteristiques"
 * combine S, F, p ET directrice dans un seul écran, une seule étape de tentatives.
 *
 * Aide PROGRESSIVE par écran — pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis où
 * l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceEquationParaboleDeveloppee, GenerateurExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionEquationParaboleDeveloppee, ReponseEcranCaracteristiques, ResultatExerciceEquationParaboleDeveloppee } from "./typesEquationParaboleDeveloppee";
import { verifierCaracteristiques, verifierCompletionCarre, verifierRegroupement } from "./verificationEquationParaboleDeveloppee";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_REGROUPEMENT = 2;
export const NIVEAU_AIDE_MAX_COMPLETION = 2;
export const NIVEAU_AIDE_MAX_CARACTERISTIQUES = 2;

function etatInitial(
  exercice: ExerciceEquationParaboleDeveloppee,
): Pick<
  EtatSessionEquationParaboleDeveloppee,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideRegroupement"
  | "niveauAideCompletion"
  | "niveauAideCaracteristiques"
  | "scoreRegroupementExercice"
  | "regroupementRevele"
  | "regroupementAideUtilisee"
  | "scoreCompletionExercice"
  | "completionRevele"
  | "completionAideUtilisee"
> {
  return {
    exerciceCourant: exercice,
    phase: "regroupement",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideRegroupement: 0,
    niveauAideCompletion: 0,
    niveauAideCaracteristiques: 0,
    scoreRegroupementExercice: null,
    regroupementRevele: false,
    regroupementAideUtilisee: false,
    scoreCompletionExercice: null,
    completionRevele: false,
    completionAideUtilisee: false,
  };
}

export function demarrerSessionEquationParaboleDeveloppee(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceEquationParaboleDeveloppee,
): EtatSessionEquationParaboleDeveloppee {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionEquationParaboleDeveloppee): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationParaboleDeveloppee): EtatSessionEquationParaboleDeveloppee {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "regroupement") {
    if (etat.niveauAideRegroupement >= NIVEAU_AIDE_MAX_REGROUPEMENT) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideRegroupement: etat.niveauAideRegroupement + 1 };
  }
  if (etat.phase === "completion") {
    if (etat.niveauAideCompletion >= NIVEAU_AIDE_MAX_COMPLETION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideCompletion: etat.niveauAideCompletion + 1 };
  }
  if (etat.niveauAideCaracteristiques >= NIVEAU_AIDE_MAX_CARACTERISTIQUES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideCaracteristiques: etat.niveauAideCaracteristiques + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionEquationParaboleDeveloppee,
  resultat: ResultatExerciceEquationParaboleDeveloppee,
): EtatSessionEquationParaboleDeveloppee {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Écran "regroupement" — mène toujours à "completion". */
export function soumettreReponseRegroupement(etat: EtatSessionEquationParaboleDeveloppee, reponse: string): EtatSessionEquationParaboleDeveloppee {
  if (etat.terminee || etat.phase !== "regroupement") {
    throw new Error("soumettreReponseRegroupement : la session n'est pas à l'étape regroupement");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRegroupement(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideRegroupement);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "completion",
    scoreRegroupementExercice: score,
    regroupementRevele: etapeCourante.revelee,
    regroupementAideUtilisee: etat.niveauAideRegroupement > 0,
  };
}

/** Écran "completion" — mène toujours à "caracteristiques". */
export function soumettreReponseCompletion(etat: EtatSessionEquationParaboleDeveloppee, reponse: string): EtatSessionEquationParaboleDeveloppee {
  if (etat.terminee || etat.phase !== "completion") {
    throw new Error("soumettreReponseCompletion : la session n'est pas à l'étape completion");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCompletionCarre(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCompletion);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "caracteristiques",
    scoreCompletionExercice: score,
    completionRevele: etapeCourante.revelee,
    completionAideUtilisee: etat.niveauAideCompletion > 0,
  };
}

/** Écran "caracteristiques" (dernier, toujours terminal) — clôture toujours l'exercice. */
export function soumettreReponseCaracteristiques(etat: EtatSessionEquationParaboleDeveloppee, reponse: ReponseEcranCaracteristiques): EtatSessionEquationParaboleDeveloppee {
  if (etat.terminee || etat.phase !== "caracteristiques") {
    throw new Error("soumettreReponseCaracteristiques : la session n'est pas à l'étape caracteristiques");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseEcranCaracteristiques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCaracteristiques(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCaracteristiques);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreRegroupement: etat.scoreRegroupementExercice as number,
    regroupementRevele: etat.regroupementRevele,
    regroupementAideUtilisee: etat.regroupementAideUtilisee,
    scoreCompletion: etat.scoreCompletionExercice as number,
    completionRevele: etat.completionRevele,
    completionAideUtilisee: etat.completionAideUtilisee,
    scoreCaracteristiques: score,
    caracteristiquesRevele: etapeCourante.revelee,
    caracteristiquesAideUtilisee: etat.niveauAideCaracteristiques > 0,
  });
}
