/**
 * Couche B — moteur de session pour "Équation d'un cercle (non développée) à partir d'un graphe".
 * N'importe jamais rien de `src/generateurs/` — voir `sessionEquationCercle.test.ts` pour la preuve
 * avec un générateur factice.
 *
 * 3 phases FIXES, toujours dans le même ordre : `centre → rayon → equation` — aucun saut
 * conditionnel, les deux variantes traversant exactement la même séquence (même principe que
 * "Relations entre droites").
 *
 * Aide PROGRESSIVE par écran — pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis où
 * l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceEquationCercle, GenerateurExerciceEquationCercle } from "../core/equationCercle.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionEquationCercle, ResultatExerciceEquationCercle } from "./typesEquationCercle";
import { verifierCentre, verifierEquationExercice, verifierRayon } from "./verificationEquationCercle";
import type { ReponseCentre } from "./verificationEquationCercle";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_CENTRE = 2;
export const NIVEAU_AIDE_MAX_RAYON = 2;
export const NIVEAU_AIDE_MAX_EQUATION = 1;

function etatInitial(
  exercice: ExerciceEquationCercle,
): Pick<
  EtatSessionEquationCercle,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideCentre"
  | "niveauAideRayon"
  | "niveauAideEquation"
  | "scoreCentreExercice"
  | "centreRevele"
  | "centreAideUtilisee"
  | "scoreRayonExercice"
  | "rayonRevele"
  | "rayonAideUtilisee"
> {
  return {
    exerciceCourant: exercice,
    phase: "centre",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideCentre: 0,
    niveauAideRayon: 0,
    niveauAideEquation: 0,
    scoreCentreExercice: null,
    centreRevele: false,
    centreAideUtilisee: false,
    scoreRayonExercice: null,
    rayonRevele: false,
    rayonAideUtilisee: false,
  };
}

export function demarrerSessionEquationCercle(reglages: ReglagesSession, generateur: GenerateurExerciceEquationCercle): EtatSessionEquationCercle {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionEquationCercle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationCercle): EtatSessionEquationCercle {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "centre") {
    if (etat.niveauAideCentre >= NIVEAU_AIDE_MAX_CENTRE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideCentre: etat.niveauAideCentre + 1 };
  }
  if (etat.phase === "rayon") {
    if (etat.niveauAideRayon >= NIVEAU_AIDE_MAX_RAYON) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideRayon: etat.niveauAideRayon + 1 };
  }
  if (etat.niveauAideEquation >= NIVEAU_AIDE_MAX_EQUATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideEquation: etat.niveauAideEquation + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationCercle, resultat: ResultatExerciceEquationCercle): EtatSessionEquationCercle {
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

/** Écran "centre" — mène toujours à "rayon". */
export function soumettreReponseCentre(etat: EtatSessionEquationCercle, reponse: ReponseCentre): EtatSessionEquationCercle {
  if (etat.terminee || etat.phase !== "centre") {
    throw new Error("soumettreReponseCentre : la session n'est pas à l'étape centre");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseCentre>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCentre(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCentre);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "rayon",
    scoreCentreExercice: score,
    centreRevele: etapeCourante.revelee,
    centreAideUtilisee: etat.niveauAideCentre > 0,
  };
}

/** Écran "rayon" — mène toujours à "equation". */
export function soumettreReponseRayon(etat: EtatSessionEquationCercle, reponse: number): EtatSessionEquationCercle {
  if (etat.terminee || etat.phase !== "rayon") {
    throw new Error("soumettreReponseRayon : la session n'est pas à l'étape rayon");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRayon(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideRayon);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equation",
    scoreRayonExercice: score,
    rayonRevele: etapeCourante.revelee,
    rayonAideUtilisee: etat.niveauAideRayon > 0,
  };
}

/** Écran "equation" (dernière phase) — clôture toujours l'exercice. */
export function soumettreReponseEquation(etat: EtatSessionEquationCercle, reponse: string): EtatSessionEquationCercle {
  if (etat.terminee || etat.phase !== "equation") {
    throw new Error("soumettreReponseEquation : la session n'est pas à l'étape equation");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEquationExercice(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideEquation);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreCentre: etat.scoreCentreExercice as number,
    centreRevele: etat.centreRevele,
    centreAideUtilisee: etat.centreAideUtilisee,
    scoreRayon: etat.scoreRayonExercice as number,
    rayonRevele: etat.rayonRevele,
    rayonAideUtilisee: etat.rayonAideUtilisee,
    scoreEquation: score,
    equationRevele: etapeCourante.revelee,
    equationAideUtilisee: etat.niveauAideEquation > 0,
  });
}
