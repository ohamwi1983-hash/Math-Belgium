/**
 * Couche B — moteur de session pour "Norme d'un vecteur et distance entre 2 points" (chapitre
 * "Calcul vectoriel"), nouveau générateur (`promptcreationgenerateur26normedistance.md`). N'importe
 * jamais rien de src/generateurs — voir sessionNormeDistance.test.ts pour la preuve avec des
 * générateurs factices.
 *
 * Chaque variante traverse une SÉQUENCE FIXE et disjointe des autres (`SEQUENCES`,
 * `typesNormeDistance.ts`) — `soumettrePhase` (privée) factorise le motif commun (tentatives,
 * pénalité additive par niveau d'aide, transition vers l'écran suivant ou clôture de l'exercice) ;
 * chaque `soumettreReponseXxx` exporté n'est qu'un thin wrapper typé par écran — même patron exact
 * que `sessionOrthogonalite.ts` (générateur 25).
 */
import type { ExerciceNormeDistance, GenerateurExerciceNormeDistance } from "../core/normeDistance.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  type ReponseCalculIsocele,
  type ReponseCalculPythagore,
  type ReponseClassificationIsocele,
  type ReponseConstructionDistance,
  type ReponseConstructionIsocele,
  type ReponseConstructionPythagore,
  type ReponseTestPythagore,
  verifierCalculDistance,
  verifierCalculIsocele,
  verifierCalculPythagore,
  verifierConclusionIsocele,
  verifierConstructionDistance,
  verifierConstructionIsocele,
  verifierConstructionPythagore,
  verifierNormeVecteur,
  verifierReductionParametreNorme,
  verifierResolutionParametreNorme,
  verifierTestPythagore,
} from "./verificationNormeDistance";
import { NIVEAU_AIDE_MAX, SEQUENCES } from "./typesNormeDistance";
import type { EtatSessionNormeDistance, PhaseNormeDistance, ResultatExerciceNormeDistance, ScoreEcran } from "./typesNormeDistance";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function phaseInitiale(exercice: ExerciceNormeDistance): PhaseNormeDistance {
  return SEQUENCES[exercice.variante][0];
}

function phaseSuivante(exercice: ExerciceNormeDistance, phaseActuelle: PhaseNormeDistance): PhaseNormeDistance | null {
  const sequence = SEQUENCES[exercice.variante];
  const index = sequence.indexOf(phaseActuelle);
  return index + 1 < sequence.length ? sequence[index + 1] : null;
}

function etatInitial(
  exercice: ExerciceNormeDistance,
): Pick<EtatSessionNormeDistance, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresAccumules"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: {},
  };
}

export function demarrerSessionNormeDistance(reglages: ReglagesSession, generateur: GenerateurExerciceNormeDistance): EtatSessionNormeDistance {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionNormeDistance): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité additive, jamais sous 0 — un cran de plus retire toujours 20 points supplémentaires. */
function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, si le
 * niveau maximal de l'écran courant est déjà atteint, ou si cet écran n'a pas d'aide du tout
 * (`max=0`, rien à révéler). */
export function activerAideSuivante(etat: EtatSessionNormeDistance): EtatSessionNormeDistance {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const max = NIVEAU_AIDE_MAX[etat.phase];
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function champVide(): { score: number | null; revele: boolean; niveauAide: number } {
  return { score: null, revele: false, niveauAide: 0 };
}

function champ(scoresAccumules: Partial<Record<PhaseNormeDistance, ScoreEcran>>, phase: PhaseNormeDistance) {
  return scoresAccumules[phase] ?? champVide();
}

function construireResultat(
  exercice: ExerciceNormeDistance,
  scoresAccumules: Partial<Record<PhaseNormeDistance, ScoreEcran>>,
): ResultatExerciceNormeDistance {
  const normeVecteur = champ(scoresAccumules, "normeVecteur");
  const constructionDistance = champ(scoresAccumules, "constructionDistance");
  const calculDistance = champ(scoresAccumules, "calculDistance");
  const constructionIsocele = champ(scoresAccumules, "constructionIsocele");
  const calculIsocele = champ(scoresAccumules, "calculIsocele");
  const conclusionIsocele = champ(scoresAccumules, "conclusionIsocele");
  const reductionParametreNorme = champ(scoresAccumules, "reductionParametreNorme");
  const resolutionParametreNorme = champ(scoresAccumules, "resolutionParametreNorme");
  const constructionPythagore = champ(scoresAccumules, "constructionPythagore");
  const calculPythagore = champ(scoresAccumules, "calculPythagore");
  const testPythagore = champ(scoresAccumules, "testPythagore");

  return {
    variante: exercice.variante,
    scoreNormeVecteur: normeVecteur.score,
    normeVecteurRevele: normeVecteur.revele,
    niveauAideNormeVecteur: normeVecteur.niveauAide,
    scoreConstructionDistance: constructionDistance.score,
    constructionDistanceRevele: constructionDistance.revele,
    niveauAideConstructionDistance: constructionDistance.niveauAide,
    scoreCalculDistance: calculDistance.score,
    calculDistanceRevele: calculDistance.revele,
    niveauAideCalculDistance: calculDistance.niveauAide,
    scoreConstructionIsocele: constructionIsocele.score,
    constructionIsoceleRevele: constructionIsocele.revele,
    niveauAideConstructionIsocele: constructionIsocele.niveauAide,
    scoreCalculIsocele: calculIsocele.score,
    calculIsoceleRevele: calculIsocele.revele,
    niveauAideCalculIsocele: calculIsocele.niveauAide,
    scoreConclusionIsocele: conclusionIsocele.score,
    conclusionIsoceleRevele: conclusionIsocele.revele,
    niveauAideConclusionIsocele: conclusionIsocele.niveauAide,
    scoreReductionParametreNorme: reductionParametreNorme.score,
    reductionParametreNormeRevele: reductionParametreNorme.revele,
    niveauAideReductionParametreNorme: reductionParametreNorme.niveauAide,
    scoreResolutionParametreNorme: resolutionParametreNorme.score,
    resolutionParametreNormeRevele: resolutionParametreNorme.revele,
    niveauAideResolutionParametreNorme: resolutionParametreNorme.niveauAide,
    scoreConstructionPythagore: constructionPythagore.score,
    constructionPythagoreRevele: constructionPythagore.revele,
    niveauAideConstructionPythagore: constructionPythagore.niveauAide,
    scoreCalculPythagore: calculPythagore.score,
    calculPythagoreRevele: calculPythagore.revele,
    niveauAideCalculPythagore: calculPythagore.niveauAide,
    scoreTestPythagore: testPythagore.score,
    testPythagoreRevele: testPythagore.revele,
    niveauAideTestPythagore: testPythagore.niveauAide,
  };
}

function cloturerExerciceOuSuivant(etat: EtatSessionNormeDistance, resultat: ResultatExerciceNormeDistance): EtatSessionNormeDistance {
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

/** Factorise le motif commun à tous les écrans : tentatives, pénalité additive par niveau d'aide,
 * transition vers l'écran suivant de la séquence de la variante, ou clôture de l'exercice si
 * `phaseAttendue` est la dernière de sa séquence. */
function soumettrePhase<R>(
  etat: EtatSessionNormeDistance,
  phaseAttendue: PhaseNormeDistance,
  reponse: R,
  verifier: (reponse: R) => boolean,
): EtatSessionNormeDistance {
  if (etat.terminee || etat.phase !== phaseAttendue) {
    throw new Error(`soumettrePhase(${phaseAttendue}) : la session n'est pas à cette étape`);
  }

  const etapeCourante = soumettreEtapeTentatives<R>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules: Partial<Record<PhaseNormeDistance, ScoreEcran>> = {
    ...etat.scoresAccumules,
    [phaseAttendue]: { score, revele: etapeCourante.revelee, niveauAide: etat.niveauAide },
  };

  const suivante = phaseSuivante(etat.exerciceCourant, phaseAttendue);
  if (suivante === null) {
    return cloturerExerciceOuSuivant(etat, construireResultat(etat.exerciceCourant, scoresAccumules));
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: suivante, niveauAide: 0, scoresAccumules };
}

// ============================================================================
// Un wrapper par écran — voir `verificationNormeDistance.ts` pour la logique de vérification
// ============================================================================

export function soumettreReponseNormeVecteur(etat: EtatSessionNormeDistance, texte: string): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "vecteur") throw new Error("soumettreReponseNormeVecteur : réservé à la variante 'vecteur'");
  return soumettrePhase(etat, "normeVecteur", texte, (t) => verifierNormeVecteur(exercice, t));
}

export function soumettreReponseConstructionDistance(etat: EtatSessionNormeDistance, reponse: ReponseConstructionDistance): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "distance") throw new Error("soumettreReponseConstructionDistance : réservé à la variante 'distance'");
  return soumettrePhase(etat, "constructionDistance", reponse, (r) => verifierConstructionDistance(exercice, r));
}

export function soumettreReponseCalculDistance(etat: EtatSessionNormeDistance, texte: string): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "distance") throw new Error("soumettreReponseCalculDistance : réservé à la variante 'distance'");
  return soumettrePhase(etat, "calculDistance", texte, (t) => verifierCalculDistance(exercice, t));
}

export function soumettreReponseConstructionIsocele(etat: EtatSessionNormeDistance, reponse: ReponseConstructionIsocele): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "isocele") throw new Error("soumettreReponseConstructionIsocele : réservé à la variante 'isocele'");
  return soumettrePhase(etat, "constructionIsocele", reponse, (r) => verifierConstructionIsocele(exercice, r));
}

export function soumettreReponseCalculIsocele(etat: EtatSessionNormeDistance, reponse: ReponseCalculIsocele): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "isocele") throw new Error("soumettreReponseCalculIsocele : réservé à la variante 'isocele'");
  return soumettrePhase(etat, "calculIsocele", reponse, (r) => verifierCalculIsocele(exercice, r));
}

export function soumettreReponseConclusionIsocele(etat: EtatSessionNormeDistance, reponse: ReponseClassificationIsocele): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "isocele") throw new Error("soumettreReponseConclusionIsocele : réservé à la variante 'isocele'");
  return soumettrePhase(etat, "conclusionIsocele", reponse, (r) => verifierConclusionIsocele(exercice, r));
}

export function soumettreReponseReductionParametreNorme(etat: EtatSessionNormeDistance, texte: string): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "parametre") throw new Error("soumettreReponseReductionParametreNorme : réservé à la variante 'parametre'");
  return soumettrePhase(etat, "reductionParametreNorme", texte, (t) => verifierReductionParametreNorme(exercice, t));
}

export function soumettreReponseResolutionParametreNorme(etat: EtatSessionNormeDistance, valeurs: number[]): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "parametre") throw new Error("soumettreReponseResolutionParametreNorme : réservé à la variante 'parametre'");
  return soumettrePhase(etat, "resolutionParametreNorme", valeurs, (v) => verifierResolutionParametreNorme(exercice, v));
}

export function soumettreReponseConstructionPythagore(etat: EtatSessionNormeDistance, reponse: ReponseConstructionPythagore): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pythagore") throw new Error("soumettreReponseConstructionPythagore : réservé à la variante 'pythagore'");
  return soumettrePhase(etat, "constructionPythagore", reponse, (r) => verifierConstructionPythagore(exercice, r));
}

export function soumettreReponseCalculPythagore(etat: EtatSessionNormeDistance, reponse: ReponseCalculPythagore): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pythagore") throw new Error("soumettreReponseCalculPythagore : réservé à la variante 'pythagore'");
  return soumettrePhase(etat, "calculPythagore", reponse, (r) => verifierCalculPythagore(exercice, r));
}

export function soumettreReponseTestPythagore(etat: EtatSessionNormeDistance, reponse: ReponseTestPythagore): EtatSessionNormeDistance {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pythagore") throw new Error("soumettreReponseTestPythagore : réservé à la variante 'pythagore'");
  return soumettrePhase(etat, "testPythagore", reponse, (r) => verifierTestPythagore(exercice, r));
}
