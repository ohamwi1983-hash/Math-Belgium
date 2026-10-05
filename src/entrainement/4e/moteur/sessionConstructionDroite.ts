/**
 * Couche B — moteur de session pour "Construction graphique — tracer une droite depuis son
 * équation". N'importe jamais rien de `src/generateurs/` — voir `sessionConstructionDroite.test.ts`
 * pour la preuve avec un générateur factice.
 *
 * 2 phases FIXES, toujours dans le même ordre : `points → trace` — aucun saut conditionnel
 * (contrairement à "Équation d'une droite", ce générateur n'a jamais de cas "forme impossible").
 *
 * Aide PROGRESSIVE par écran (même principe que "Colinéarité"/"Orthogonalité"/"Équation d'une
 * droite") : 2 niveaux sur "points", 1 seul sur "trace" — pénalité ADDITIVE (-20 points/niveau)
 * appliquée au moment précis où l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceConstructionDroite, GenerateurExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionConstructionDroite, ResultatExerciceConstructionDroite } from "./typesConstructionDroite";
import { verifierPoints, verifierTrace } from "./verificationConstructionDroite";
import type { ReponsePoints } from "./verificationConstructionDroite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_POINTS = 2;
export const NIVEAU_AIDE_MAX_TRACE = 1;

function pointCanoniqueSecond(exercice: ExerciceConstructionDroite): Point {
  return { x: exercice.point.x + exercice.vecteur.x, y: exercice.point.y + exercice.vecteur.y };
}

function etatInitial(exercice: ExerciceConstructionDroite): Pick<
  EtatSessionConstructionDroite,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAidePoints"
  | "niveauAideTrace"
  | "scorePointsExercice"
  | "pointsRevele"
  | "cible1"
  | "cible2"
> {
  return {
    exerciceCourant: exercice,
    phase: "points",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAidePoints: 0,
    niveauAideTrace: 0,
    scorePointsExercice: null,
    pointsRevele: false,
    cible1: null,
    cible2: null,
  };
}

export function demarrerSessionConstructionDroite(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceConstructionDroite,
): EtatSessionConstructionDroite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionConstructionDroite): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionConstructionDroite): EtatSessionConstructionDroite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "points") {
    if (etat.niveauAidePoints >= NIVEAU_AIDE_MAX_POINTS) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePoints: etat.niveauAidePoints + 1 };
  }
  if (etat.niveauAideTrace >= NIVEAU_AIDE_MAX_TRACE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideTrace: etat.niveauAideTrace + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionConstructionDroite, resultat: ResultatExerciceConstructionDroite): EtatSessionConstructionDroite {
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

/** Écran "points" — mène toujours à "trace". Fixe `cible1`/`cible2` : les valeurs SOUMISES par
 * l'élève si la clôture vient d'une réussite (n'importe quelle paire valide, jamais la paire
 * canonique imposée), ou la paire canonique de l'exercice si la clôture vient d'une révélation. */
export function soumettreReponsePoints(etat: EtatSessionConstructionDroite, reponse: ReponsePoints): EtatSessionConstructionDroite {
  if (etat.terminee || etat.phase !== "points") {
    throw new Error("soumettreReponsePoints : la session n'est pas à l'étape points");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponsePoints>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPoints(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoints);

  const cible1: Point = etapeCourante.reussie ? { x: reponse.x1, y: reponse.y1 } : exercice.point;
  const cible2: Point = etapeCourante.reussie ? { x: reponse.x2, y: reponse.y2 } : pointCanoniqueSecond(exercice);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "trace",
    scorePointsExercice: score,
    pointsRevele: etapeCourante.revelee,
    cible1,
    cible2,
  };
}

export interface ReponseTrace {
  p1: Point;
  p2: Point;
}

/** Écran "trace" (dernière phase) — clôture toujours l'exercice. */
export function soumettreReponseTrace(etat: EtatSessionConstructionDroite, reponse: ReponseTrace): EtatSessionConstructionDroite {
  if (etat.terminee || etat.phase !== "trace" || etat.cible1 === null || etat.cible2 === null) {
    throw new Error("soumettreReponseTrace : la session n'est pas à l'étape trace");
  }
  const exercice = etat.exerciceCourant;
  const cible1 = etat.cible1;
  const cible2 = etat.cible2;

  const etapeCourante = soumettreEtapeTentatives<ReponseTrace>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTrace(cible1, cible2, r.p1, r.p2),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideTrace);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scorePoints: etat.scorePointsExercice as number,
    pointsRevele: etat.pointsRevele,
    pointsAideUtilisee: etat.niveauAidePoints > 0,
    scoreTrace: score,
    traceRevele: etapeCourante.revelee,
    traceAideUtilisee: etat.niveauAideTrace > 0,
  });
}
